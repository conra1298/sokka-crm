'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/services/auth.service';
import { createTask, toggleTaskCompletion } from '@/lib/services/task.service';

export async function createTaskAction(prevState: any, formData: FormData) {
  const user = await requireAuth();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const dueDate = formData.get('dueDate') as string;
  const assignedTo = formData.get('assignedTo') as string;
  const contactId = formData.get('contactId') as string;
  const dealId = formData.get('dealId') as string;

  if (!title) return { error: 'Task Title is required.' };

  try {
    const newTask = await createTask(
      {
        title,
        description,
        dueDate,
        assignedTo,
        contactId,
        dealId,
      },
      user
    );

    revalidatePath('/tasks');
    revalidatePath('/dashboard');
    return { success: true, task: newTask };
  } catch (err: any) {
    return { error: err.message || 'Failed to create task.' };
  }
}

export async function toggleTaskAction(taskId: string, isCompleted: boolean) {
  const user = await requireAuth();
  try {
    await toggleTaskCompletion(taskId, isCompleted, user);
    revalidatePath('/tasks');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update task.' };
  }
}
