import { NextResponse } from "next/server";

type GitHubPullRequest = { number: number; merged_at: string | null };
type GitHubIssue = { number: number; body?: string; pull_request?: unknown };
type GitHubCommit = {
  commit?: { author?: { date?: string } };
};
type GitHubDeployment = {
  id: number;
  created_at: string;
  environment?: string;
};
type GitHubComment = { body: string };

const WINDOW_DAYS = 7;
const WEEKDAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;

  if (!token || !repository || !repository.includes("/")) {
    return metricsResponse(
      [
        "# Missing GITHUB_TOKEN or GITHUB_REPOSITORY.",
        "booksmap_github_metrics_collection_error 1",
        "booksmap_github_metrics_data_points 0",
      ],
      503,
    );
  }

  const [owner, repo] = repository.split("/", 2);
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  try {
    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    };
    const [pullRequests, issues, commits] = await Promise.all([
      fetchGitHub<GitHubPullRequest[]>(
        `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100`,
        headers,
      ),
      fetchGitHub<GitHubIssue[]>(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=closed&since=${since.toISOString()}&per_page=100`,
        headers,
      ),
      fetchGitHub<GitHubCommit[]>(
        `https://api.github.com/repos/${owner}/${repo}/commits?since=${since.toISOString()}&per_page=100`,
        headers,
      ),
    ]);
    const deployments = await fetchGitHub<GitHubDeployment[]>(
      `https://api.github.com/repos/${owner}/${repo}/deployments?environment=Production&since=${since.toISOString()}&per_page=100`,
      headers,
    );

    const mergedPullRequests = pullRequests.filter(
      (pullRequest) =>
        pullRequest.merged_at && new Date(pullRequest.merged_at) >= since,
    ).length;
    const resolvedIssues = issues.filter((issue) => !issue.pull_request).length;
    const commitsByHour = Array.from({ length: 24 }, () => 0);
    const commitsByWeekday = Array.from({ length: 7 }, () => 0);
    const leadTimes: number[] = [];

    for (const commit of commits) {
      const date = commit.commit?.author?.date
        ? new Date(commit.commit.author.date)
        : null;
      if (!date || Number.isNaN(date.getTime())) continue;

      const koreaDate = new Date(
        date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
      );
      commitsByHour[koreaDate.getHours()] += 1;
      commitsByWeekday[koreaDate.getDay()] += 1;
    }

    for (const pullRequest of pullRequests) {
      if (!pullRequest.merged_at || new Date(pullRequest.merged_at) < since) continue;
      const prCommits = await fetchGitHub<GitHubCommit[]>(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${pullRequest.number}/commits?per_page=100`,
        headers,
      );
      const dates = prCommits
        .map((commit) => commit.commit?.author?.date)
        .filter((date): date is string => Boolean(date))
        .map((date) => Date.parse(date))
        .filter(Number.isFinite);
      if (dates.length > 0) {
        leadTimes.push((Date.parse(pullRequest.merged_at) - Math.min(...dates)) / 60000);
      }
    }

    const incidentIssues = issues.filter(
      (issue) => !issue.pull_request,
    );
    const recoveryTimes: number[] = [];
    for (const issue of incidentIssues) {
      const startedAt = issue.body?.match(/Started at: (.+)/)?.[1];
      if (!startedAt) continue;
      const comments = await fetchGitHub<GitHubComment[]>(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}/comments?per_page=100`,
        headers,
      );
      const recoveredAt = comments
        .map((comment) => comment.body.match(/Recovered at: (.+)/)?.[1])
        .find(Boolean);
      if (recoveredAt) {
        recoveryTimes.push((Date.parse(recoveredAt) - Date.parse(startedAt)) / 60000);
      }
    }

    const leadTimeMinutes = average(leadTimes);
    const mttrMinutes = average(recoveryTimes);
    const deploymentFrequency = deployments.length;
    const changeFailureRate =
      deploymentFrequency === 0
        ? 0
        : (incidentIssues.length / deploymentFrequency) * 100;

    const lines = [
      "# HELP booksmap_github_merged_pull_requests_total Merged pull requests in the last 7 days.",
      "# TYPE booksmap_github_merged_pull_requests_total gauge",
      `booksmap_github_merged_pull_requests_total ${mergedPullRequests}`,
      "# HELP booksmap_github_resolved_issues_total Resolved issues in the last 7 days.",
      "# TYPE booksmap_github_resolved_issues_total gauge",
      `booksmap_github_resolved_issues_total ${resolvedIssues}`,
      "# HELP booksmap_github_commits_total Commits in the last 7 days.",
      "# TYPE booksmap_github_commits_total gauge",
      `booksmap_github_commits_total ${commits.length}`,
      "# HELP booksmap_dora_lead_time_minutes Average PR lead time in the last 7 days.",
      "# TYPE booksmap_dora_lead_time_minutes gauge",
      `booksmap_dora_lead_time_minutes ${leadTimeMinutes}`,
      "# HELP booksmap_dora_deployment_frequency_total Production deployments in the last 7 days.",
      "# TYPE booksmap_dora_deployment_frequency_total gauge",
      `booksmap_dora_deployment_frequency_total ${deploymentFrequency}`,
      "# HELP booksmap_dora_change_failure_rate_percent Change failure rate in the last 7 days.",
      "# TYPE booksmap_dora_change_failure_rate_percent gauge",
      `booksmap_dora_change_failure_rate_percent ${changeFailureRate}`,
      "# HELP booksmap_dora_mttr_minutes Mean time to restore in the last 7 days.",
      "# TYPE booksmap_dora_mttr_minutes gauge",
      `booksmap_dora_mttr_minutes ${mttrMinutes}`,
      "# HELP booksmap_github_commits_by_hour Commits by hour in Korea Standard Time.",
      "# TYPE booksmap_github_commits_by_hour gauge",
      ...commitsByHour.map(
        (count, hour) =>
          `booksmap_github_commits_by_hour{hour="${hour}"} ${count}`,
      ),
      "# HELP booksmap_github_commits_by_weekday Commits by weekday in Korea Standard Time.",
      "# TYPE booksmap_github_commits_by_weekday gauge",
      ...commitsByWeekday.map(
        (count, weekday) =>
          `booksmap_github_commits_by_weekday{weekday="${WEEKDAY_NAMES[weekday]}"} ${count}`,
      ),
      "booksmap_github_metrics_collection_error 0",
      `booksmap_github_metrics_data_points ${mergedPullRequests + resolvedIssues + commits.length}`,
    ];

    return metricsResponse(lines);
  } catch (error) {
    console.error("GitHub metrics collection failed", error);
    return metricsResponse(
      [
        "# GitHub API metrics collection failed.",
        "booksmap_github_metrics_collection_error 1",
        "booksmap_github_metrics_data_points 0",
      ],
      503,
    );
  }
}

async function fetchGitHub<T>(
  url: string,
  headers: Record<string, string>,
): Promise<T> {
  const response = await fetch(url, { headers, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`GitHub API request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

function metricsResponse(lines: string[], status = 200) {
  return new NextResponse(`${lines.join("\n")}\n`, {
    status,
    headers: { "Content-Type": "text/plain; version=0.0.4; charset=utf-8" },
  });
}

function average(values: number[]) {
  return values.length === 0
    ? 0
    : Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}
