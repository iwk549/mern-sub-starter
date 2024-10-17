"use client";

import AuthedPage from "@/components/common/authedPage";
import { useProject } from "@/hooks/useProject";
import ProjectForm from "@/components/project/projectForm";
import { Project, Module } from "@/types/data.types";
import Button from "@/components/common/button";
import Icon from "@/components/common/icon";
import Confirm from "@/components/common/confirm";
import Header from "@/components/common/header";
import CardList from "@/components/common/cardList";
import NewModuleForm from "@/components/module/newModuleForm";

export default function Projects() {
  const {
    projects,
    selectedProject,
    setSelectedProject,
    handleSave,
    handleOpenProject,
    showProjectForm,
    handleOpenProjectForm,
    handleDeleteProject,
    thisId,
    handleCloseProject,
    modules,
    confirmDelete,
    setConfirmDelete,
    handleOpenModule,
    newModuleFormOpen,
    setNewModuleFormOpen,
    handleAddModule,
    handleDeleteModule,
  } = useProject();

  return (
    // <AuthedPage>
    <div>
      <ProjectForm
        onSave={handleSave}
        project={selectedProject}
        setProject={setSelectedProject}
        show={showProjectForm}
      />
      {!thisId ? (
        <div>
          <Button
            size={projects.length ? "small" : "medium"}
            clickHandler={() => handleOpenProjectForm({ name: "", _id: "new" })}
          >
            Create New Project
          </Button>
          <CardList
            items={projects}
            additionalKeys={[
              {
                label: "Owned by:",
                func: (p: Project) => p.ownerId?.name || "",
              },
            ]}
            buttons={[
              {
                type: "primary",
                tooltip: "Open",
                clickHandler: (p: Project) => handleOpenProject(p),
                label: <Icon name="open" />,
              },
              {
                type: "secondary",
                tooltip: "Edit",
                clickHandler: (p: Project) => handleOpenProjectForm(p),
                label: <Icon name="edit" />,
              },
              {
                type: "dark",
                tooltip: "Remove",
                clickHandler: (p: Project) => {
                  setConfirmDelete({ open: true, type: "Project", item: p });
                },
                label: <Icon name="delete" />,
              },
            ]}
          />
        </div>
      ) : (
        <div>
          <Button size="small" type="dark" clickHandler={handleCloseProject}>
            Back to All Projects
          </Button>
          <Header>{selectedProject?.name}</Header>
          <Button
            size={modules.length ? "small" : "medium"}
            clickHandler={() => setNewModuleFormOpen(true)}
          >
            Add New Module
          </Button>
          <CardList
            items={modules}
            buttons={[
              {
                type: "primary",
                tooltip: "Open",
                clickHandler: (m: Module) => handleOpenModule(m),
                label: <Icon name="open" />,
              },
              {
                type: "dark",
                tooltip: "Remove",
                clickHandler: (m: Module) =>
                  setConfirmDelete({ open: true, type: "Module", item: m }),
                label: <Icon name="delete" />,
              },
            ]}
          />
          <NewModuleForm
            onSave={handleAddModule}
            showForm={newModuleFormOpen}
            setShowForm={setNewModuleFormOpen}
          />
        </div>
      )}
      <Confirm
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false })}
        header={`Remove ${confirmDelete.type}: ${confirmDelete.item?.name}`}
        body={
          <div className="text-center">
            <p>
              Removing a {confirmDelete.type?.toLowerCase()} will schedule the
              project and all related items to be deleted.
              <br />
              It can be restored until the specified retention period has
              passed.
            </p>
          </div>
        }
        buttons={[
          {
            text: "Cancel",
            onClick: () => {
              setConfirmDelete({ open: false });
            },
          },
          {
            text: `Remove this ${confirmDelete.type}`,
            onClick: async () => {
              if (confirmDelete.type === "Project")
                await handleDeleteProject(confirmDelete.item as Project);
              else if (confirmDelete.type === "Module")
                await handleDeleteModule(confirmDelete.item as Module);

              setConfirmDelete({ open: false });
            },
          },
        ]}
      />
    </div>
    // </AuthedPage>
  );
}
