import { useContext, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppContext from "@/context/appContext/appContext";
import {
  deleteProject,
  getProjects,
  saveProject,
} from "@/services/project.service";
import toastUtil from "@/utils/toast.util";
import { Project, Module } from "@/types/data.types";
import {
  deleteModule,
  getModules,
  saveModule,
} from "@/services/module.service";
import { createModulePath } from "@/utils/modules.util";

export function useProject() {
  const { setLoading } = useContext(AppContext);
  const params = useSearchParams();
  const router = useRouter();

  const [thisId, setThisId] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modules, setModules] = useState([]);
  const [newModuleFormOpen, setNewModuleFormOpen] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    type?: "Project" | "Module";
    item?: Project | Module;
  }>({ open: false });

  const getData = async () => {
    setLoading(true);
    const ownedOnly = params.get("owned");
    const deleted = params.get("deleted");
    const id = params.get("id");
    const projectsRes = await getProjects(!!ownedOnly, deleted);
    if (projectsRes.status === 200) {
      if (id) {
        const modulesRes = await getModules(id, deleted);
        if (modulesRes.status === 200) {
          setModules(modulesRes.body);
          setSelectedProject(
            projectsRes.body.find((p: Project) => p._id === id)
          );
          setThisId(id);
        } else toastUtil.error(modulesRes.body);
      } else setThisId("");
      setProjects(projectsRes.body);
    } else toastUtil.error(projectsRes.body);
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, [params]);

  const handleSave = async (data: Project) => {
    setLoading(true);
    const isNew = selectedProject?._id === "new";
    const res = await saveProject(data, selectedProject?._id);
    if (res.status === 200) {
      toastUtil.success(`Project ${isNew ? "Created" : "Saved"}`);
      router.replace(`/project?id=${res.body._id}`);
      setShowProjectForm(false);
    } else toastUtil.error(res.body);
    setLoading(false);
  };

  const handleOpenProjectForm = (project: Project) => {
    setSelectedProject(project);
    setShowProjectForm(true);
  };

  const handleOpenProject = (project: Project) => {
    setShowProjectForm(false);
    setSelectedProject(project);
    router.replace(`/project?id=${project._id}`);
  };

  const handleCloseProject = () => {
    router.replace("/project");
  };

  const handleDeleteProject = async (project: Project | null) => {
    if (!project) return;
    setLoading(true);
    const res = await deleteProject(project);
    if (res.status === 200) {
      router.replace("/project");
      toastUtil.success("Project Removed");
      setSelectedProject(null);
      setConfirmDelete({ open: false });
      return getData();
    } else {
      toastUtil.error(res.body);
    }
    setLoading(false);
  };

  const handleAddModule = async (module: Module) => {
    setLoading(true);
    module.projectId = params.get("id") || "";
    module.values = {};
    const res = await saveModule(module);
    if (res.status === 200) {
      router.push(
        createModulePath(
          res.body.projectId,
          res.body.material,
          res.body.module,
          res.body._id
        )
      );
    } else toastUtil.error(res.body);
    setLoading(false);
  };

  const handleOpenModule = (module: Module) => {
    router.replace(
      `module?id=${module._id}&projectId=${selectedProject?._id}&material=samples&module=sampleModule`
    );
  };

  const handleDeleteModule = async (module: Module) => {
    setLoading(true);
    const res = await deleteModule(module._id!);
    if (res.status === 200) {
      toastUtil.success("Module removed");
      return getData();
    } else toastUtil.error(res.body);
    setLoading(false);
  };

  return {
    projects,
    modules,
    selectedProject,
    setSelectedProject,
    handleSave,
    handleOpenProject,
    showProjectForm,
    handleOpenProjectForm,
    handleDeleteProject,
    confirmDelete,
    setConfirmDelete,
    thisId,
    handleCloseProject,
    handleOpenModule,
    newModuleFormOpen,
    setNewModuleFormOpen,
    handleAddModule,
    handleDeleteModule,
  };
}
