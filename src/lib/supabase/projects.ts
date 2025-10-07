import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types-updated';
import { uploadFilesToStorage } from './storage';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type Milestone = Database['public']['Tables']['milestones']['Row'];
type MilestoneInsert = Database['public']['Tables']['milestones']['Insert'];

export interface ProjectWithMilestones extends Project {
  milestones: Milestone[];
}

export interface CreateProjectData {
  title: string;
  description: string;
  totalBudget: number;
  totalTimeline: number;
  currency: string;
  complexity: string;
  repoUrl?: string;
  designLink?: string;
  dependencies?: string;
  uploadedFiles?: File[]; // Changed to File[] for actual file uploads
  milestones: Array<{
    title: string;
    outcome: string;
    proof: string;
    videoDescription: string;
    timeline: string;
    rewardAmount: string;
    currency: string;
    payout: string;
    startDate: string;
    endDate: string;
    orderIndex: number;
  }>;
}

/**
 * Create a new project with milestones
 */
export async function createProjectWithMilestones(
  userId: string,
  projectData: CreateProjectData
): Promise<{ projectId: string; success: boolean; error?: string }> {
  try {
    console.log('createProjectWithMilestones called with:', { userId, projectData });
    
    // Prepare milestones data for the function
    const milestonesData = projectData.milestones.map((milestone, index) => ({
      title: milestone.title,
      outcome: milestone.outcome,
      proof: milestone.proof,
      videoDescription: milestone.videoDescription,
      timeline: parseInt(milestone.timeline),
      rewardAmount: parseFloat(milestone.rewardAmount),
      currency: milestone.currency,
      payout: parseFloat(milestone.payout),
      startDate: milestone.startDate,
      endDate: milestone.endDate,
      orderIndex: index
    }));

    console.log('Prepared milestones data:', milestonesData);

    // First, create the project to get the project ID
    const { data: projectResult, error: projectError } = await supabase.rpc('create_project_with_milestones', {
      p_user_id: userId,
      p_title: projectData.title,
      p_description: projectData.description,
      p_total_budget: projectData.totalBudget,
      p_total_timeline_days: projectData.totalTimeline,
      p_currency: projectData.currency,
      p_complexity: projectData.complexity,
      p_repo_url: projectData.repoUrl || null,
      p_design_link: projectData.designLink || null,
      p_dependencies: projectData.dependencies || null,
      p_uploaded_files: [], // Will be updated after file uploads
      p_milestones: milestonesData
    });

    if (projectError) {
      console.error('Error creating project:', projectError);
      return { projectId: '', success: false, error: projectError.message };
    }

    const projectId = projectResult;
    console.log('Project created with ID:', projectId);

    // Upload files if any
    let uploadedFilesData: any[] = [];
    if (projectData.uploadedFiles && projectData.uploadedFiles.length > 0) {
      console.log('Uploading files to storage...');
      const uploadResult = await uploadFilesToStorage(
        projectData.uploadedFiles,
        projectId,
        userId
      );

      if (uploadResult.success) {
        uploadedFilesData = uploadResult.files;
        console.log('Files uploaded successfully:', uploadedFilesData);
      } else {
        console.warn('Some files failed to upload:', uploadResult.errors);
        // Continue with project creation even if some files fail
        uploadedFilesData = uploadResult.files;
      }

      // Update the project with uploaded files data
      const { error: updateError } = await supabase
        .from('projects')
        .update({ uploaded_files: uploadedFilesData })
        .eq('id', projectId);

      if (updateError) {
        console.error('Error updating project with files:', updateError);
        // Don't fail the entire operation for file update errors
      }
    }

    return { projectId, success: true };
  } catch (error) {
    console.error('Error creating project:', error);
    return { 
      projectId: '', 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get a project with its milestones
 */
export async function getProjectWithMilestones(
  projectId: string
): Promise<{ project: ProjectWithMilestones | null; success: boolean; error?: string }> {
  try {
    // Get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return { project: null, success: false, error: projectError.message };
    }

    // Get milestones
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index');

    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError);
      return { project: null, success: false, error: milestonesError.message };
    }

    return { 
      project: { ...project, milestones: milestones || [] }, 
      success: true 
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return { 
      project: null, 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get all projects for a user
 */
export async function getUserProjects(
  userId: string
): Promise<{ projects: Project[]; success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user projects:', error);
      return { projects: [], success: false, error: error.message };
    }

    return { projects: data || [], success: true };
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return { 
      projects: [], 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  projectId: string,
  status: 'draft' | 'published' | 'completed' | 'cancelled'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('update_project_status', {
      p_project_id: projectId,
      p_status: status
    });

    if (error) {
      console.error('Error updating project status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating project status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Delete a project and its milestones
 */
export async function deleteProject(
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Update milestone status
 */
export async function updateMilestoneStatus(
  milestoneId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('milestones')
      .update(updateData)
      .eq('id', milestoneId);

    if (error) {
      console.error('Error updating milestone status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating milestone status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
