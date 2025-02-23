export type Task = {
    id: number;
    name: string;
    category_id?: number;
    note?: string;
    due_date?: string;
    due_time?: string;
    remainder?: string;
    repeat?: string;
    is_done: boolean;
    priority: number;
    progress: number;
    created_at?: string;
    sub_tasks ?: Subtask[]
}
export type Subtask = {
    id : number;
    name : string;
    is_done : boolean;
    task_id : number;
}
export type History = {
    id : number;
    task_id : number;
    completed_date : string;
    completed_time : string;
    completed_for : string;
    created_at : string;
}