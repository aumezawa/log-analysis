import * as React from "react"
import { useRef, useCallback, useReducer } from "react"

import { CaretRight, CaretRightFill, Dot, QuestionCircle, Tools } from "react-bootstrap-icons"
import { House } from "react-bootstrap-icons"
import { FolderCheck, FolderPlus, FolderX, Folder, Folder2Open } from "react-bootstrap-icons"
import { JournalArrowUp, JournalCheck, JournalX, Journal } from "react-bootstrap-icons"
import { FileEarmarkText } from "react-bootstrap-icons"
import { Box, HddStack } from "react-bootstrap-icons"

import UniqueId from "../../lib/unique-id"

import DomainSelectModal from "../complexes/domain-select-modal"
import ProjectCreateModal from "../complexes/project-create-modal"
import ProjectSelectModal from "../complexes/project-select-modal"
import BundleUploadModal from "../complexes/bundle-upload-modal"
import BundleSelectModal from "../complexes/bundle-select-modal"
import MultiSelectModal from "../specifics/vmlog/multi-select-modal"

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
  onChangeBundle  : (bundleId: string) => void,
  onChangeHosts   : (hosts: string) => void,
  onChangeVms     : (vms: string) => void
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
  onChangeBundle  = undefined,
  onChangeHosts   = undefined,
  onChangeVms     = undefined
}) => {
  const [ignored,       forceUpdate]       = useReducer(x => x + 1, 0)
  const [reloadProject, updateProjectList] = useReducer(x => x + 1, 0)
  const [reloadBundle,  updateBundleList]  = useReducer(x => x + 1, 0)
  const [reloadSelect,  updateSelectList]  = useReducer(x => x + 1, 0)

  const id = useRef({
    domainSelect  : "modal-" + UniqueId(),
    projectCreate : "modal-" + UniqueId(),
    projectSelect : "modal-" + UniqueId(),
    bundleUpload  : "modal-" + UniqueId(),
    bundleSelect  : "modal-" + UniqueId(),
    multiSelect   : "modal-" + UniqueId()
  })

  const data = useRef({
    action    : "open",
    mode      : "hosts",
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

  const handleChangeSelect = useCallback((value: string) => {
    if (data.current.mode === "hosts" && onChangeHosts) {
      onChangeHosts(value)
    }
    if (data.current.mode === "vms" && onChangeVms) {
      onChangeVms(value)
    }
  }, [onChangeHosts, onChangeVms])

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

  const handleClickCompareHosts = useCallback(() => {
    data.current.mode = "hosts"
    updateSelectList()
  }, [true])

  const handleClickCompareVms = useCallback(() => {
    data.current.mode = "vms"
    updateSelectList()
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
      <MultiSelectModal
        id={ id.current.multiSelect }
        domain={ domain }
        project={ project }
        mode={ data.current.mode }
        reload={ reloadSelect }
        onSubmit={ handleChangeSelect }
      />
      <div className="flex-container-row align-items-center">
        <div className="borderable">
          <Button
            label={ domain || "Select Domain" }
            LIcon={ House }
            color={ domain ? (domain !== "private" ? "success" : "warning") : "secondary" }
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
                disabled={ !domain }
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
            disabled={ !domain }
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
                disabled={ !domain }
                toggle="modal"
                target={ id.current.projectCreate }
              />,
              <DropdownItem
                key="close-project"
                label="Close"
                LIcon={ Folder }
                disabled={ !domain }
                toggle="modal"
                target={ id.current.projectSelect }
                onClick={ handleClickCloseProject }
              />,
              <DropdownItem
                key="reopen-project"
                label="Reopen"
                LIcon={ Folder2Open }
                disabled={ !domain }
                toggle="modal"
                target={ id.current.projectSelect }
                onClick={ handleClickReopenProject }
              />,
              <DropdownItem
                key="delete-project"
                label="Delete"
                LIcon={ FolderX }
                disabled={ !domain || (!["public", "private"].includes(domain) && privilege !== "root") }
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
              />,
              <DropdownDivider key="divider-2" />,
              <DropdownItem
                key="compare-hosts"
                label="Commpare Hosts"
                LIcon={ HddStack }
                disabled={ !domain || !project }
                toggle="modal"
                target={ id.current.multiSelect }
                onClick={ handleClickCompareHosts }
              />,
              <DropdownItem
                key="compare-vms"
                label="Commpare VMs"
                LIcon={ Box }
                disabled={ !domain || !project }
                toggle="modal"
                target={ id.current.multiSelect }
                onClick={ handleClickCompareVms }
              />
            ] }
          />
        </div>
      </div>
    </>
  )
})

export default ProjectNavigator
