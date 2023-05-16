export * from "@hapi/hapi";

interface IdNameLabel {
  id: number;
  name: string;
}

export namespace Params {
  export interface Version {
    name: string;
    status: "open" | "locked" | "closed";
    sharing: "" | "descendants" | "hierarchy" | "tree" | "system";
    due_date: string;
    description: string;
    wiki_page_title: string;
  }
  export interface IssueList {
    offset: number;
    limit: number;
    sort: string;
    include: "attachments" | "relations";
    issue_id: "";
    project_id: number;
    subproject_id: "";
    tracker_id: number;
    status_id: number;
    assigned_to_id: number;
    parent_id: number;
    cf_x: string;
  }
  export interface IssueInfo {
    project_id: number;
    tracker_id: number;
    status_id: number;
    priority_id: number;
    subject: string;
    description: string;
    category_id: number;
    fixed_version_id: number;
    assigned_to_id: number;
    parent_issue_id: number;
    custom_fields: string;
    watcher_user_ids: string[];
    is_private: boolean;
    estimated_hours: number;
  }
}

export namespace Data {
  export interface Issue {
    id: number;
    project: IdNameLabel;
    tracker: IdNameLabel;
    status: IdNameLabel;
    priority: IdNameLabel;
    author: IdNameLabel;
    assigned_to: IdNameLabel;
    fixed_version: IdNameLabel;
    subject: string;
    description: string;
    start_date: string;
    due_date: string;
    done_ratio: number;
    is_private: boolean;
    estimated_hours: number;
    created_on: string;
    updated_on: string;
    closed_on: string;
  }
  export interface Version {
    id: number;
    project: IdNameLabel;
    name: string;
    description: string;
    status: string;
    due_date: string;
    sharing: string;
    wiki_page_title: string;
    created_on: string;
    updated_on: string;
  }
}

export as namespace Hapi;
