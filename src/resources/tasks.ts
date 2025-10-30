type ID = string;

enum Status {
    TODO,
    IN_PROGRESS,
    DONE,
    CANCELLED,
    ARCHIVED
}

enum Tags {
    WORK,
    PERSONAL,
    URGENT,
    LOW_PRIORITY
}

interface Task {
    id: ID;
    title: string;
    description?: string;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
    deadline?: Date;
    tags?: Tags[];
}


/**
 * Loads an array of tasks from the browser's localStorage.
 *
 * Reads the string value stored under the 'tasks' key, parses it as JSON,
 * and maps each plain object to a {@link Task} instance, converting
 * `createdAt` and `updatedAt` timestamp strings to `Date` objects.
 *
 * Behavior:
 * - If no value exists under the 'tasks' key, an empty array is returned.
 * - Each parsed item is expected to be an object with the properties:
 *   `id`, `title`, `description`, `status`, `createdAt`, and `updatedAt`.
 * - `createdAt` and `updatedAt` are converted via `new Date(...)`.
 * - The function does not perform exhaustive validation of task fields;
 *   it performs a best-effort mapping from the stored plain object to {@link Task}.
 *
 * @returns {Task[]} An array of tasks loaded from localStorage. If the key is
 *   missing, returns an empty array. Dates are returned as `Date` instances.
 *
 * @throws {SyntaxError} If the data stored under the 'tasks' key is not valid JSON,
 *   `JSON.parse` will throw a SyntaxError.
 *
 * @remarks
 * - Side effects: reads from `localStorage` only; it does not write or mutate stored data.
 * - Consumers should ensure stored data follows the expected shape or wrap calls in a try/catch
 *   to handle malformed data gracefully.
 *
 * @example
 * // Typical usage:
 * // const tasks = loadTasks();
 * // tasks.forEach(t => console.log(t.title, t.createdAt instanceof Date)); 
 */
function loadTasks(): Task[] {
    const tasks = localStorage.getItem('tasks');
    let taskList: Task[] = [];
    if (tasks) {
        for (const task of JSON.parse(tasks)) {
            let taskItem: Task = {
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                createdAt: new Date(task.createdAt),
                updatedAt: new Date(task.updatedAt),
                deadline: task.deadline ? new Date(task.deadline) : undefined,
                tags: task.tags ? task.tags.map((tag: string) => Tags[tag as keyof typeof Tags]) : []
            };
            taskList.push(taskItem);
        }
    }

    return taskList;
}

function loadTodayTasks(): Task[] {
    const allTasks = loadTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allTasks.filter(task => {
        const taskDeadline = task.deadline ? new Date(task.deadline) : undefined;
        return taskDeadline && taskDeadline.toDateString() === today.toDateString();
    });
}

function loadArchivedTasks(): Task[] {
    const allTasks = loadTasks();
    return allTasks.filter(task => task.status === Status.ARCHIVED);
}

function loadTasksForHome(filter: { searchTerm?: string; status?: Status }, sortBy: 'createdAt' | 'updatedAt' | 'deadline' = 'deadline'): Task[] {
    const allTasks = loadTasks();
    return allTasks.filter(task => {
        const matchesSearchTerm = filter.searchTerm ? task.title.includes(filter.searchTerm) : true;
        const matchesStatus = filter.status !== undefined ? task.status === filter.status : true;
        return matchesSearchTerm && matchesStatus;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function saveAllTasks(tasks: Task[]): void {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask(task: Task): void {
    const tasks = loadTasks();
    tasks.push(task);
    saveAllTasks(tasks);
}


export type { ID, Task };
export { Status, loadTasks, addTask, saveAllTasks, loadTodayTasks, loadArchivedTasks, loadTasksForHome };