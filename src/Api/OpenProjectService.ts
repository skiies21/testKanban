import api from './index';

interface IUpdate {
  spentTime?: string;
  estimatedTime?: string;
  _links?: { status: { href: string } };
  lockVersion: number | undefined;
}

const SLESARI_ID:string = "21"; //Тип "СЛЕСАРИ" ID 21
const PLAN_ID:string = "18" // "В плане" - Status ID 18
const WORK_ID:string = "16" // "В работе" - Status ID 16
const CHECK_ID:string = "24" // "На проверке" - Status ID 24

const QUERY:{}[] = [{"type_id":{"operator":"=","values":[SLESARI_ID]}}, { "status": { "operator": "=", "values": [PLAN_ID, WORK_ID, CHECK_ID]}}]

export class OpenProjectService {
  // static async getAllTasks() {
  //   const { data } = await api.get('/projects/test/work_packages');
  //   return data;
  // }

  // static async getAllProjects() {
  //   const { data } = await api.get('/projects');
  //   return data;
  // }

  static async getProjects() {
    let allProjects = [];
    let page = 10000;
    let pageSize = 100000;

    while (true) {
      //делаем запрос только для данного типа
      const query = [{"type":{"operator":"=","values":[SLESARI_ID]}}];
      const { data } = await api.get('/projects', {
        params: { filters: JSON.stringify(query), page, pageSize },
      });

      allProjects.push(data);
      if (!data || !data.length) {
        break;
      }
      page++;
    }
  
    return allProjects;
  }

  static async getAllTaskByProject(project_id: number) { 
    const { status } = await api.get(`/projects/${project_id}/work_packages?filters=${JSON.stringify(QUERY)}`);
    let data
    if (status === 200) {  
      const response  = await api.get(`/projects/${project_id}/work_packages?filters=${JSON.stringify(QUERY)}`);
      data = response.data 
    } else {
      const response = await api.get(`/projects/${project_id}/work_packages`); 
      data = response.data?._embedded?.elements || [];
    }  
    return data;
  }
  
  static async updateTask(upd_data: IUpdate, id: number | undefined) {
    const { data } = await api.patch(`work_packages/${id}`, upd_data);
    return data;
  }

  static async getTask(id: number | undefined) {
    const { data } = await api.get(`work_packages/${id}`);
    return data;
  }

  static async updateTaskToDefault(id: number | undefined, upd_data: IUpdate) {
    const { data } = await api.patch(`work_packages/${id}`, upd_data);
    return data;
  }

  static async updateTime(
    upd_data: {
      hours: string;
      spentOn: string;
      lockVersion: number | undefined;
      _links: { workPackage: { href: string } };
      comment: { format: string; raw: string };
    },
    id: number | undefined
  ) {
    const { data } = await api.post(`/time_entries`, upd_data);
    return data;
  }
}