import * as React from "react"
import { useRef, useCallback, useReducer } from "react"

import { CaretRight, CaretRightFill, Dot, Tools } from "react-bootstrap-icons"
import { House } from "react-bootstrap-icons"
import { FolderCheck, FolderPlus, FolderX, Folder, Folder2Open } from "react-bootstrap-icons"
import { FileEarmarkMedical } from "react-bootstrap-icons"
import { JournalArrowDown, JournalArrowUp, JournalCheck, JournalX, Journal } from "react-bootstrap-icons"
import { Window, WindowSidebar } from "react-bootstrap-icons"
import { Terminal } from "react-bootstrap-icons"
import { PersonPlus } from "react-bootstrap-icons"
import { FileEarmarkText } from "react-bootstrap-icons"
import { Box, ClipboardCheck, HddStack } from "react-bootstrap-icons"

import UniqueId from "../../lib/unique-id"
import Environment from "../../lib/environment"
import Privilege from "../../lib/project-privilege"

import DomainSelectModal from "../complexes/domain-select-modal"
import ProjectCreateModal from "../complexes/project-create-modal"
import ProjectSelectModal from "../complexes/project-select-modal"
import BundleUploadModal from "../complexes/bundle-upload-modal"
import BundleSelectModal from "../complexes/bundle-select-modal"
import MultiSelectModal from "../specifics/vmlog/multi-select-modal"
import DownloadReportModal from "../specifics/vmlog/download-report-modal"

import Button from "../parts/button"
import DropdownButton from "../parts/dropdown-button"
import DropdownDivider from "../parts/dropdown-divider"
import DropdownHeader from "../parts/dropdown-header"
import DropdownItem from "../parts/dropdown-item"

type ProjectNavigatorProps = {
  menu?           : string,
  privilege?      : string,
  domains         : string,
  domain          : string,
  project         : string,
  bundle          : string,
  filename        : string,
  terminal        : string,
  host            : string,
  vm              : string,
  dump            : string,
  focus           : string,
  onChangeMenu?   : (enabled: boolean) => void,
  onChangeDomain  : (domainName: string) => void,
  onChangeProject : (projectName: string) => void,
  onChangeBundle  : (bundleId: string, bundleType: string) => void,
  onChangeHosts   : (hosts: string) => void,
  onChangeVms     : (vms: string) => void,
  onClickConsole  : () => void
}

const ProjectNavigator = React.memo<ProjectNavigatorProps>(({
  menu            = null,
  privilege       = "none",
  domains         = "public,private",
  domain          = null,
  project         = null,
  bundle          = null,
  filename        = null,
  terminal        = null,
  host            = null,
  vm              = null,
  dump            = null,
  focus           = null,
  onChangeMenu    = undefined,
  onChangeDomain  = undefined,
  onChangeProject = undefined,
  onChangeBundle  = undefined,
  onChangeHosts   = undefined,
  onChangeVms     = undefined,
  onClickConsole  = undefined
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
    multiSelect   : "modal-" + UniqueId(),
    downloadReport: "modal-" + UniqueId()
  })

  const data = useRef({
    action    : "open",
    mode      : "hosts",
    bundleName: null
  })

  const handleClickShowMenu = useCallback(() => {
    if (onChangeMenu) {
      onChangeMenu(true)
    }
  }, [true])

  const handleClickHideMenu = useCallback(() => {
    if (onChangeMenu) {
      onChangeMenu(false)
    }
  }, [true])

  const handleChangeDomain = useCallback((domainName: string) => {
    if (onChangeDomain) {
      onChangeDomain(domainName)
    }
  }, [onChangeDomain])

  const handleChangeProject = useCallback((projectName: string) => {
    if (data.current.action === "open" || data.current.action === "reopen") {
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

  const handleChangeBundle = useCallback((bundleId: string, bundleName: string, bundleType: string) => {
    if (data.current.action === "open") {
      data.current.bundleName = bundleName
      if (onChangeBundle) {
        onChangeBundle(bundleId, bundleType)
      }
    }
    if ((data.current.action === "delete") && (bundleId === bundle)) {
      data.current.bundleName = null
      if (onChangeBundle) {
        onChangeBundle(null, null)
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

  const handleClickDownloadBundle = useCallback(() => {
    data.current.action = "download"
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

  const handleClickOpenConsole = useCallback(() => {
    if (onClickConsole) {
      onClickConsole()
    }
  }, [onClickConsole])

  const handleClickInviteUser = useCallback(() => {
    const textarea = document.createElement("textarea")
    const url = Environment.getAddressBar()
    textarea.value = url.includes("?") ? (url + "&anonymous=true") : (url + "?anonymous=true")
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand("copy")
    textarea.remove()
    alert("Copied an invite URL on your clipboard.")
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
        onSubmit={ handleChangeProject }
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
        onSubmit={ handleChangeBundle }
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
      <DownloadReportModal
        id={ id.current.downloadReport }
        domain={ domain }
        project={ project }
        bundle={ bundle }
      />
      <div className="flex-container-row align-items-center">
        <div className="borderable">
          <Button
            label={ domain || "Select Domain" }
            LIcon={ House }
            color={ domain ? (domain !== "private" ? "success" : "warning") : "secondary" }
            disabled={ !Privilege.isDomainSelectable(privilege) }
            toggle="modal"
            target={ id.current.domainSelect }
          />
        </div>
        <CaretRightFill />
        <div className="borderable">
          { !project &&
            <>
              <Button
                label="New Project"
                LIcon={ FolderPlus }
                color="info"
                disabled={ !domain || !Privilege.isProjectCreatable(privilege, domain) }
                toggle="modal"
                target={ id.current.projectCreate }
                onClick={ handleClickOpenProject }
              />
              <Dot />
            </>
          }
          <Button
            label={ project || "Select Project" }
            LIcon={ project ? FolderCheck : Folder }
            color={ project ? "success" : "secondary" }
            disabled={ !domain || !Privilege.isProjectOpenable(privilege, domain) }
            toggle="modal"
            target={ id.current.projectSelect }
            onClick={ handleClickOpenProject }
          />
        </div>
        { project &&
          <>
            <CaretRightFill />
            <div className="borderable">
              { !bundle &&
                <>
                  <Button
                    label="Upload Bundle"
                    LIcon={ JournalArrowUp }
                    color="info"
                    disabled={ !domain || !project || !Privilege.isBundleUploadable(privilege, domain) }
                    toggle="modal"
                    target={ id.current.bundleUpload }
                    onClick={ handleClickOpenBundle }
                  />
                  <Dot />
                </>
              }
              <Button
                label={ (bundle && data.current.bundleName) || "Select Bundle" }
                LIcon={ (bundle && data.current.bundleName) ? JournalCheck : Journal }
                color={ (bundle && data.current.bundleName) ? "success" : "secondary" }
                disabled={ !domain || !project || !Privilege.isBundleOpenable(privilege, domain) }
                toggle="modal"
                target={ id.current.bundleSelect }
                onClick={ handleClickOpenBundle }
              />
            </div>
          </>
        }
        { focus === "filename" && filename &&
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
        { focus === "terminal" && terminal &&
          <>
            <CaretRightFill />
            <div className="borderable">
              <Button
                label={ terminal }
                LIcon={ Terminal }
                color="success"
                noAction={ true }
              />
            </div>
          </>
        }
        { focus === "host" && host &&
          <>
            <CaretRightFill />
            <div className="borderable">
              <Button
                label={ host }
                LIcon={ HddStack }
                color="success"
                noAction={ true }
              />
            </div>
          </>
        }
        { focus === "vm" && vm &&
          <>
            <CaretRightFill />
            <div className="borderable">
              <Button
                label={ vm }
                LIcon={ Box }
                color="success"
                noAction={ true }
              />
            </div>
          </>
        }
        { focus === "dump" && dump &&
          <>
            <CaretRightFill />
            <div className="borderable">
              <Button
                label={ dump }
                LIcon={ FileEarmarkMedical }
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
              menu && <DropdownHeader
                key="view-setting"
                label="View Settings"
              />,
              menu && <DropdownItem
                key="view-left-show"
                label="Show Left Menu"
                LIcon={ WindowSidebar }
                disabled={ menu === "on" }
                onClick={ handleClickShowMenu }
              />,
              menu && <DropdownItem
                key="view-left-hide"
                label="Hide Left Menu"
                LIcon={ Window }
                disabled={ menu === "off" }
                onClick={ handleClickHideMenu }
              />,
              menu && <DropdownDivider key="divider-0" />,
              <DropdownHeader
                key="project-header"
                label="Project Operations"
              />,
              <DropdownItem
                key="create-project"
                label="Create New"
                LIcon={ FolderPlus }
                disabled={ !domain || !Privilege.isProjectCreatable(privilege, domain) }
                toggle="modal"
                target={ id.current.projectCreate }
              />,
              <DropdownItem
                key="close-project"
                label="Close"
                LIcon={ Folder }
                disabled={ !domain || !Privilege.isProjectClosable(privilege, domain) }
                toggle="modal"
                target={ id.current.projectSelect }
                onClick={ handleClickCloseProject }
              />,
              <DropdownItem
                key="reopen-project"
                label="Reopen"
                LIcon={ Folder2Open }
                disabled={ !domain || !Privilege.isProjectReOpenable(privilege, domain) }
                toggle="modal"
                target={ id.current.projectSelect }
                onClick={ handleClickReopenProject }
              />,
              <DropdownItem
                key="delete-project"
                label="Delete"
                LIcon={ FolderX }
                disabled={ !domain || !Privilege.isProjectDeletable(privilege, domain) }
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
                disabled={ !domain || !project || !Privilege.isBundleUploadable(privilege, domain) }
                toggle="modal"
                target={ id.current.bundleUpload }
              />,
              <DropdownItem
                key="delete-bundle"
                label="Delete"
                LIcon={ JournalX }
                disabled={ !domain || !project || !Privilege.isBundleDeletable(privilege, domain) }
                toggle="modal"
                target={ id.current.bundleSelect }
                onClick={ handleClickDeleteBundle }
              />,
              <DropdownItem
                key="download-bundle"
                label="Download"
                LIcon={ JournalArrowDown }
                disabled={ !domain || !project || !Privilege.isBundleDownloadable(privilege, domain) }
                toggle="modal"
                target={ id.current.bundleSelect }
                onClick={ handleClickDownloadBundle }
              />,
              <DropdownDivider key="divider-2" />,
              <DropdownHeader
                key="advance-header"
                label="Advanced Operations"
              />,
              <DropdownItem
                key="console"
                label="Open Console"
                LIcon={ Terminal }
                disabled={ !domain || !project || !bundle || !Privilege.isConsoleOpenable(privilege, domain) }
                onClick={ handleClickOpenConsole }
              />,
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
              />,
              <DropdownItem
                key="download-report"
                label="Download Report"
                LIcon={ ClipboardCheck }
                disabled={ !domain || !project || !bundle }
                toggle="modal"
                target={ id.current.downloadReport }
              />,
              <DropdownItem
                key="invite"
                label="Invite Guest"
                LIcon={ PersonPlus }
                disabled={ !domain || !project || !Privilege.isInvitable(privilege, domain) }
                onClick={ handleClickInviteUser }
              />
            ] }
          />
        </div>
      </div>
    </>
  )
})

export default ProjectNavigator
