const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

function initMailer() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log('[NotificationService] Email transporter initialized');
    } else {
        console.log('[NotificationService] SMTP not configured, emails disabled');
    }
}

async function sendEmail(to, subject, html) {
    if (!transporter) {
        console.log(`[Email] Disabled - would send to ${to}: ${subject}`);
        return false;
    }

    try {
        const info = await transporter.sendMail({
            from: `"SmartTasker" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
        console.log(`[Email] Sent to ${to}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email] Failed to send to ${to}:`, error.message);
        return false;
    }
}

const NotificationService = {
    init() {
        initMailer();
    },

    async notifyTaskCreated(task, creator, assignedUser, team) {
        const message = `
            <h2>New Task Created</h2>
            <p><strong>Title:</strong> ${task.title}</p>
            <p><strong>Description:</strong> ${task.description || 'No description'}</p>
            <p><strong>Created by:</strong> ${creator.name}</p>
            ${assignedUser ? `<p><strong>Assigned to:</strong> ${assignedUser.name}</p>` : ''}
            ${team ? `<p><strong>Team:</strong> ${team.name}</p>` : ''}
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${task.id}">View Task</a></p>
        `;

        console.log(`[Notification] Task created: "${task.title}" by ${creator.email}`);

        if (assignedUser && assignedUser.email) {
            await sendEmail(assignedUser.email, `New Task Assigned: ${task.title}`, message);
        }

        return true;
    },

    async notifyTaskUpdated(task, oldStatus, newStatus, updater) {
        const message = `
            <h2>Task Updated</h2>
            <p><strong>Title:</strong> ${task.title}</p>
            <p><strong>Status changed:</strong> ${oldStatus} → ${newStatus}</p>
            ${task.blocked_reason ? `<p><strong>Blocked Reason:</strong> ${task.blocked_reason}</p>` : ''}
            <p><strong>Updated by:</strong> ${updater.name}</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${task.id}">View Task</a></p>
        `;

        console.log(`[Notification] Task updated: "${task.title}" - ${oldStatus} → ${newStatus}`);

        const recipients = new Set();
        if (task.assigned_to_email) recipients.add(task.assigned_to_email);
        if (task.created_by_email) recipients.add(task.created_by_email);

        for (const email of recipients) {
            await sendEmail(email, `Task Updated: ${task.title}`, message);
        }

        if (newStatus === 'in_progress') {
            await this.notifyTaskInProgress(task, updater);
        }

        return true;
    },

    async notifyTaskInProgress(task, updater) {
        const message = `
            <h2>Task Started</h2>
            <p><strong>Title:</strong> ${task.title}</p>
            <p><strong>Status changed to:</strong> In Progress</p>
            <p><strong>Started by:</strong> ${updater.name}</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${task.id}">View Task</a></p>
        `;

        console.log(`[Notification] Task started: "${task.title}" by ${updater.name}`);

        const recipients = new Set();
        if (task.assigned_to_email) recipients.add(task.assigned_to_email);
        if (task.created_by_email) recipients.add(task.created_by_email);

        for (const email of recipients) {
            await sendEmail(email, `Task Started: ${task.title}`, message);
        }

        return true;
    },

    async notifyTaskAssigned(task, assignedUser, assigner) {
        const message = `
            <h2>Task Assigned to You</h2>
            <p><strong>Title:</strong> ${task.title}</p>
            <p><strong>Description:</strong> ${task.description || 'No description'}</p>
            <p><strong>Assigned by:</strong> ${assigner.name}</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${task.id}">View Task</a></p>
        `;

        console.log(`[Notification] Task assigned: "${task.title}" to ${assignedUser.email}`);

        if (assignedUser.email) {
            await sendEmail(assignedUser.email, `You have a new task: ${task.title}`, message);
        }

        return true;
    },

    async notifyFileUploaded(task, file, uploader) {
        const message = `
            <h2>File Uploaded to Task</h2>
            <p><strong>Task:</strong> ${task.title}</p>
            <p><strong>File:</strong> ${file.original_name}</p>
            <p><strong>Size:</strong> ${Math.round(file.size / 1024)} KB</p>
            <p><strong>Uploaded by:</strong> ${uploader.name}</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${task.id}">View Task</a></p>
        `;

        console.log(`[Notification] File uploaded: ${file.original_name} on task "${task.title}"`);

        const recipients = new Set();
        if (task.assigned_to_email) recipients.add(task.assigned_to_email);
        if (task.created_by_email) recipients.add(task.created_by_email);

        for (const email of recipients) {
            await sendEmail(email, `File uploaded: ${file.original_name}`, message);
        }

        return true;
    },

    async notifyUnassignedWarning(task, creator) {
        const message = `
            <h2>⚠️ Unassigned Task Warning</h2>
            <p>Your task has been unassigned for over 7 days:</p>
            <p><strong>Title:</strong> ${task.title}</p>
            <p><strong>Created:</strong> ${task.created_at}</p>
            <p>Please consider assigning this task to a team member.</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${task.id}">View Task</a></p>
        `;

        console.log(`[Notification] Unassigned warning for task: "${task.title}"`);

        if (creator.email) {
            await sendEmail(creator.email, `Action Required: Unassigned Task - ${task.title}`, message);
        }

        return true;
    },

    async notifyTaskCompleted(task, completor) {
        const message = `
            <h2>✅ Task Completed</h2>
            <p><strong>Title:</strong> ${task.title}</p>
            <p><strong>Completed by:</strong> ${completor.name}</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${task.id}">View Task</a></p>
        `;

        console.log(`[Notification] Task completed: "${task.title}"`);

        const recipients = new Set();
        if (task.created_by_email) recipients.add(task.created_by_email);

        for (const email of recipients) {
            await sendEmail(email, `Task Completed: ${task.title}`, message);
        }

        return true;
    }
};

module.exports = NotificationService;