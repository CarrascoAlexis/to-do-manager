/**
 * @file tasks.ts
 * @description Core task management module providing data models, enums, and utility functions
 * for task operations including loading, filtering, and persisting tasks to localStorage.
 * 
 * @module resources/tasks
 * @author Alexis Carrasco
 */

/**
 * Unique identifier type for tasks.
 * @typedef {string} ID
 */
type ID = string;

/**
 * Enumeration of possible task statuses.
 * @enum {number}
 * @property {number} TODO - Task is not yet started
 * @property {number} IN_PROGRESS - Task is currently being worked on
 * @property {number} DONE - Task has been completed
 * @property {number} CANCELLED - Task has been cancelled
 * @property {number} ARCHIVED - Task has been archived
 */
enum Status {
    TODO,
    IN_PROGRESS,
    DONE,
    CANCELLED,
    ARCHIVED
}

/**
 * Enumeration of task tags for categorization.
 * @enum {number}
 * @property {number} WORK - Work-related task
 * @property {number} PERSONAL - Personal task
 * @property {number} URGENT - Urgent priority task
 * @property {number} LOW_PRIORITY - Low priority task
 */
enum Tags {
    WORK,
    PERSONAL,
    URGENT,
    LOW_PRIORITY
}

/**
 * Interface representing a task in the todo manager application.
 * @interface Task
 * @property {ID} id - Unique identifier for the task
 * @property {string} title - Title or name of the task
 * @property {string} [description] - Optional detailed description of the task
 * @property {Status} status - Current status of the task
 * @property {Date} createdAt - Timestamp when the task was created
 * @property {Date} updatedAt - Timestamp when the task was last modified
 * @property {Date} [deadline] - Optional deadline date for task completion
 * @property {Tags[]} [tags] - Optional array of tags for task categorization
 */
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

/**
 * Loads all tasks that have a deadline set to today's date.
 * 
 * This function retrieves all tasks from localStorage and filters them to return
 * only those with a deadline matching the current date (ignoring time component).
 * 
 * @returns {Task[]} An array of tasks with deadlines set to today. Returns an empty
 *   array if no tasks are due today or if no tasks exist.
 * 
 * @remarks
 * - Time component of dates is ignored; only the date (year, month, day) is compared
 * - Tasks without a deadline are excluded from the results
 * - Useful for the "Day Tasks" view to display tasks due today
 * 
 * @example
 * // Get today's tasks
 * const todaysTasks = loadTodayTasks();
 * console.log(`You have ${todaysTasks.length} tasks due today`);
 */
function loadTodayTasks(): Task[] {
    const allTasks = loadTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allTasks.filter(task => {
        const taskDeadline = task.deadline ? new Date(task.deadline) : undefined;
        return taskDeadline && taskDeadline.toDateString() === today.toDateString();
    });
}

/**
 * Loads all tasks that have been archived.
 * 
 * This function retrieves all tasks from localStorage and filters them to return
 * only those with the ARCHIVED status.
 * 
 * @returns {Task[]} An array of archived tasks. Returns an empty array if no
 *   archived tasks exist.
 * 
 * @remarks
 * - Only tasks with status === Status.ARCHIVED are returned
 * - Useful for the "Archived" view to display completed/archived work
 * - Does not modify or remove tasks from storage
 * 
 * @example
 * // Get all archived tasks
 * const archivedTasks = loadArchivedTasks();
 * console.log(`Archive contains ${archivedTasks.length} tasks`);
 */
function loadArchivedTasks(): Task[] {
    const allTasks = loadTasks();
    return allTasks.filter(task => task.status === Status.ARCHIVED);
}

/**
 * Loads tasks with optional filtering and sorting for the Home view.
 * 
 * This function retrieves all tasks from localStorage, applies optional filters
 * (search term and status), and sorts the results by creation date in descending order.
 * 
 * @param {Object} filter - Filtering criteria for tasks
 * @param {string} [filter.searchTerm] - Optional search term to match against task titles
 * @param {Status} [filter.status] - Optional status filter to show only tasks with specific status
 * @param {'createdAt' | 'updatedAt' | 'deadline'} [sortBy='deadline'] - Field to sort by (currently unused, sorts by createdAt)
 * 
 * @returns {Task[]} A filtered and sorted array of tasks. Returns all tasks if no filters applied.
 * 
 * @remarks
 * - Search is case-sensitive and matches against task title using string inclusion
 * - When no status filter is provided, tasks of all statuses are returned
 * - Results are sorted by creation date (newest first) regardless of sortBy parameter
 * - Empty filter object returns all tasks sorted by creation date
 * 
 * @example
 * // Get all tasks
 * const allTasks = loadTasksForHome({});
 * 
 * @example
 * // Get only "In Progress" tasks
 * const inProgressTasks = loadTasksForHome({ status: Status.IN_PROGRESS });
 * 
 * @example
 * // Search for tasks containing "review"
 * const reviewTasks = loadTasksForHome({ searchTerm: 'review' });
 * 
 * @example
 * // Combine filters
 * const todoReviewTasks = loadTasksForHome({ 
 *   searchTerm: 'review', 
 *   status: Status.TODO 
 * });
 */
function loadTasksForHome(filter: { searchTerm?: string; status?: Status }, sortBy: 'createdAt' | 'updatedAt' | 'deadline' = 'deadline'): Task[] {
    const allTasks = loadTasks();
    return allTasks.filter(task => {
        const matchesSearchTerm = filter.searchTerm ? task.title.includes(filter.searchTerm) : true;
        const matchesStatus = filter.status !== undefined ? task.status === filter.status : true;
        return matchesSearchTerm && matchesStatus;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Saves an array of tasks to the browser's localStorage.
 * 
 * This function serializes the entire task array to JSON and stores it under
 * the 'tasks' key in localStorage, replacing any existing data.
 * 
 * @param {Task[]} tasks - Array of tasks to be persisted to localStorage
 * 
 * @returns {void}
 * 
 * @remarks
 * - Overwrites the entire 'tasks' key in localStorage
 * - Date objects are automatically serialized to ISO strings by JSON.stringify
 * - No validation is performed on the input array
 * - Should be called after any task modifications to persist changes
 * - May throw if localStorage quota is exceeded
 * 
 * @throws {QuotaExceededError} If localStorage storage limit is reached
 * 
 * @example
 * // Save updated task list
 * const tasks = loadTasks();
 * tasks[0].status = Status.DONE;
 * saveAllTasks(tasks);
 */
function saveAllTasks(tasks: Task[]): void {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Adds a new task to the collection and persists it to localStorage.
 * 
 * This function loads all existing tasks, appends the new task to the array,
 * and saves the updated list back to localStorage.
 * 
 * @param {Task} task - The task object to be added to the collection
 * 
 * @returns {void}
 * 
 * @remarks
 * - Automatically loads current tasks, adds the new one, and saves back to storage
 * - Does not validate for duplicate IDs
 * - The task should have all required properties including a unique ID
 * - Recommended to set createdAt and updatedAt to current timestamp before calling
 * 
 * @example
 * // Create and add a new task
 * const newTask: Task = {
 *   id: crypto.randomUUID(),
 *   title: 'Complete project documentation',
 *   description: 'Write comprehensive docs for the API',
 *   status: Status.TODO,
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 *   deadline: new Date('2025-11-15'),
 *   tags: [Tags.WORK, Tags.URGENT]
 * };
 * addTask(newTask);
 */
function addTask(task: Task): void {
    const tasks = loadTasks();
    tasks.push(task);
    saveAllTasks(tasks);
}


export type { ID, Task };
export { Status, loadTasks, addTask, saveAllTasks, loadTodayTasks, loadArchivedTasks, loadTasksForHome };