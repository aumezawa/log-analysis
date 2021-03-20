import * as React from "react"
import { useRef, useCallback, useReducer } from "react"

import { CaretRight, CaretRightFill, Dot, QuestionCircle, Tools } from "react-bootstrap-icons"
import { House } from "react-bootstrap-icons"
import { FolderCheck, FolderPlus, FolderX, Folder, Folder2Open } from "react-bootstrap-icons"
import { JournalArrowUp, JournalCheck, JournalX, Journal } from "react-bootstrap-icons"
import { FileEarmarkText } from "react-bootstrap-icons"

import UniqueId from "../../lib/unique-id"

import DomainSelectModal from "../complexes/domain-select-modal"
import ProjectCreateModal from "../complexes/project-create-modal"
import ProjectSelectModal from "../complexes/project-select-modal"
import BundleUploadModal from "../complexes/bundle-upload-modal"
import BundleSelectModal from "../complexes/bundle-select-modal"

import Button from "../parts/button"
import DropdownButton from "../parts/dropdown-button"
import DropdownDivider from "../parts/dropdown-divider"
import DropdownHeader from "../parts/dropdown-header"
import DropdownItem from "../parts/dropdown-item"

type ProjectNavigatorProps = {
  privilege?      : string,
  domains         : string,
  domain          : string,
  project         : string,
  bundle          : string,
  filename        : string,
  onChangeDomain  : (domainName: string) => void,
  onChangeProject : (projectName: string) => void,
  onChangeBundle  : (bundleId: string) => void
}

const ProjectNavigator = React.memo<ProjectNavigatorProps>(({
  privilege       = "none",
  domains         = "public,private",
  domain          = null,
  project         = null,
  bundle          = null,
  filename        = null,
  onChangeDomain  = undefined,
  onChangeProject = undefined,
  onChangeBundle  = undefined
}) => {
  const [ignored,       forceUpdate]       = useReducer(x => x + 1, 0)
  const [reloadProject, updateProjectList] = useReducer(x => x + 1, 0)
  const [reloadBundle,  updateBundleList]  = useReducer(x => x + 1, 0)

  const id = useRef({
    domainSelect  : "modal-" + UniqueId(),
    projectCreate : "modal-" + UniqueId(),
    projectSelect : "modal-" + UniqueId(),
    bundleUpload  : "modal-" + UniqueId(),
    bundleSelect  : "modal-" + UniqueId()
  })

  const data = useRef({
    action    : "open",
    bundleName: null
  })

  const handleChangeDomain = useCallback((domainName: string) => {
    if (onChangeDomain) {
      onChangeDomain(domainName)
    }
  }, [onChangeDomain])

  const handleChangeProject = useCallback((projectName: string) => {
    if (data.current.action === "open") {
      if (onChangeProject) {
        onChangeProject(projectName)
      }
    }
    if ((data.current.action === "delete" || data.current.action === "close") && (projectName === project)) {
      if (onChangeProject) {
        onChangeProject(null)
      }
    }
  }, [project, onChangeProject])

  const handleChangeBundle = useCallback((bundleId: string, bundleName: string) => {
    if (data.current.action === "open") {
      data.current.bundleName = bundleName
      if (onChangeBundle) {
        onChangeBundle(bundleId)
      }
    }
    if ((data.current.action === "delete") && (bundleId === bundle)) {
      data.current.bundleName = null
      if (onChangeBundle) {
        onChangeBundle(null)
      }
    }
  }, [bundle, onChangeBundle])

  const handleUpdateBundleName = useCallback((bundleName: string) => {
    data.current.bundleName = bundleName
    forceUpdate()
  } , [true])

  const handleClickOpenProject = useCallback(() => {
    data.current.action = "open"
    updateProjectList()
  }, [true])

  const handleClickDeleteProject = useCallback(() => {
    data.current.action = "delete"
    updateProjectList()
  }, [true])

  const handleClickReopenProject = useCallback(() => {
    data.current.action = "reopen"
    updateProjectList()
  }, [true])

  const handleClickCloseProject = useCallback(() => {
    data.current.action = "close"
    updateProjectList()
  }, [true])

  const handleClickOpenBundle = useCallback(() => {
    data.current.action = "open"
    updateBundleList()
  }, [true])

  const handleClickDeleteBundle = useCallback(() => {
    data.current.action = "delete"
    updateBundleList()
  }, [true])

  return (
    <>
      <DomainSelectModal
        id={ id.current.domainSelect }
        domains={ domains }
        domain={ domain }
        onSubmit={ handleChangeDomain }
      />
      <ProjectCreateModal
        id={ id.current.projectCreate }
        domain={ domain }
      />
      <ProjectSelectModal
        id={ id.current.projectSelect }
        privilege={ privilege }
        domain={ domain }
        action={ data.current.action }
        reload={ reloadProject }
        onSubmit={ handleChangeProject }
      />
      <BundleUploadModal
        id={ id.current.bundleUpload }
        domain={ domain }
        project={ project }
      />
      <BundleSelectModal
        id={ id.current.bundleSelect }
        domain={ domain }
        project={ project }
        bundle={ bundle }
        action={ data.current.action }
        reload={ reloadBundle }
        onSubmit={ handleChangeBundle }
        onUpdate={ handleUpdateBundleName }
      />
      <div className="flex-container-row align-items-center">
        <div className="borderable">
          <Button
            label={ domain || "Select Domain" }
            LIcon={ House }
            color={ domain ? (domain !== "private" ? "success" : "warning") : "secondary" }
            disabled={ privilege === "none" }
            toggle="modal"
            target={ id.current.domainSelect }
          />
        </div>
        <CaretRightFill />
        <div className={ `${ domain && !project && "border border-info" } borderable` }>
          { !project &&
            <>
              <Button
                label="New Project"
                LIcon={ FolderPlus }
                color="info"
                disabled={ !domain || privilege === "none" }
                toggle="modal"
                target={ id.current.projectCreate }
              />
              <Dot />
            </>
          }
          <Button
            label={ project || "Select Project" }
            LIcon={ project ? FolderCheck : Folder }
            color={ project ? "success" : "secondary" }
            disabled={ !domain || privilege === "none" }
            toggle="modal"
            target={ id.current.projectSelect }
            onClick={ handleClickOpenProject }
          />
        </div>
        { project ? <CaretRightFill /> : <CaretRight /> }
        <div className={ `${ project && !bundle && "border border-info" } borderable` }>
          { !bundle &&
            <>
              <Button
                label="Upload Bundle"
                LIcon={ JournalArrowUp }
                color="info"
                disabled={ !domain || !project }
                toggle="modal"
                target={ id.current.bundleUpload }
              />
            <Dot />
          </>
          }
          <Button
            label={ (bundle && data.current.bundleName) || "Select Bundle" }
            LIcon={ (bundle && data.current.bundleName) ? JournalCheck : Journal }
            color={ (bundle && data.current.bundleName) ? "success" : "secondary" }
            disabled={ !domain || !project }
            toggle="modal"
            target={ id.current.bundleSelect }
            onClick={ handleClickOpenBundle }
          />
        </div>
        { filename &&
          <>
            <CaretRightFill />
            <div className="borderable">
              <Button
                label={ filename }
                LIcon={ FileEarmarkText }
                color="success"
                noAction={ true }
              />
            </div>
          </>
        }
        <div className="ml-auto mr-3">
          <DropdownButton
            label="Operations"
            LIcon={ Tools }
            align="right"
            items={ [
              <DropdownHeader
                key="project-header"
                label="Project Operations"
              />,
              <DropdownItem
                key="create-project"
                label="Create New"
                LIcon={ FolderPlus }
                disabled={ !domain || privilege === "none" }
                toggle="modal"
                target={ id.current.projectCreate }
              />,
              <DropdownItem
                key="close-project"
                label="Close"
                LIcon={ Folder }
                disabled={ !domain || privilege === "none" }
                toggle="modal"
                target={ id.current.projectSelect }
                onClick={ handleClickCloseProject }
              />,
              <DropdownItem
                key="reopen-project"
                label="Reopen"
                LIcon={ Folder2Open }
                disabled={ !domain || privilege === "none" }
                toggle="modal"
                target={ id.current.projectSelect }
                onClick={ handleClickReopenProject }
              />,
              <DropdownItem
                key="delete-project"
                label="Delete"
                LIcon={ FolderX }
                disabled={ !domain || privilege === "none" || (!["public", "private"].includes(domain) && privilege !== "root") }
                toggle="modal"
                target={ id.current.projectSelect }
                onClick={ handleClickDeleteProject }
              />,
              <DropdownDivider key="divider-1" />,
              <DropdownHeader
                key="bundle-header"
                label="Bundle Operations"
              />,
              <DropdownItem
                key="upload-bundle"
                label="Upload"
                LIcon={ JournalArrowUp }
                disabled={ !domain || !project }
                toggle="modal"
                target={ id.current.bundleUpload }
              />,
              <DropdownItem
                key="delete-bundle"
                label="Delete"
                LIcon={ JournalX }
                disabled={ !domain || !project || (!["public", "private"].includes(domain) && privilege != "root") }
                toggle="modal"
                target={ id.current.bundleSelect }
                onClick={ handleClickDeleteBundle }
              />
            ] }
          />
        </div>
      </div>
    </>
  )
})

export default ProjectNavigator
