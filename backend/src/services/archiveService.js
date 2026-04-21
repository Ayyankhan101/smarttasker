const Task = require('../models/Task');

class ArchiveService {
    static checkAndArchive(completedDays = 30) {
        const tasksToArchive = Task.getForArchiving(completedDays);
        
        if (tasksToArchive.length > 0) {
            console.log(`[ArchiveService] Found ${tasksToArchive.length} tasks to archive`);
            
            tasksToArchive.forEach(task => {
                Task.archive(task.id);
                console.log(`[ArchiveService] Archived task ID: ${task.id} - "${task.title}"`);
            });
            
            return tasksToArchive.length;
        }
        
        return 0;
    }

    static getUnassignedWarnings(daysOld = 7) {
        const unassignedTasks = Task.getUnassigned(daysOld);
        
        if (unassignedTasks.length > 0) {
            console.log(`[ArchiveService] Found ${unassignedTasks.length} unassigned tasks older than ${daysOld} days`);
            unassignedTasks.forEach(task => {
                console.log(`[ArchiveService] Unassigned task: ID ${task.id} - "${task.title}" (created: ${task.created_at})`);
            });
        }
        
        return unassignedTasks;
    }
}

module.exports = ArchiveService;