import { Link } from 'react-router-dom';
import { Project, Task } from '../../../types';
import { projectProgress } from '../../../utils/workspace';

export function ProjectProgress({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  return (
    <article className="panel">
      <div className="panel-head">
        <div>
          <h2>Project progress</h2>
          <p>Completion across active work.</p>
        </div>
        <Link to="/projects">View projects</Link>
      </div>
      <div className="progress-list">
        {projects.slice(0, 5).map((project) => {
          const projectTasks = tasks.filter((task) => task.projectId === project.id);
          const progress = projectProgress(projectTasks);
          return (
            <Link className="progress-row" key={project.id} to={`/projects/${project.id}`}>
              <div>
                <strong>{project.name}</strong>
                <span>
                  {projectTasks.filter((task) => task.status === 'Completed').length} of {projectTasks.length} tasks
                  complete
                </span>
              </div>
              <div className="progress-track">
                <i style={{ width: `${progress}%` }} />
              </div>
              <b>{progress}%</b>
            </Link>
          );
        })}
      </div>
    </article>
  );
}
