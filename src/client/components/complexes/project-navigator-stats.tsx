import * as React from "react"
import { useRef, useCallback, useReducer } from "react"

import { CaretRightFill, Dot, Tools } from "react-bootstrap-icons"
import { House } from "react-bootstrap-icons"
import { FolderCheck, FolderPlus, FolderX, Folder, Folder2Open } from "react-bootstrap-icons"
import { JournalArrowUp, JournalCheck, JournalX, Journal } from "react-bootstrap-icons"
import { NodeMinus, NodePlus } from "react-bootstrap-icons"
import { PersonPlus } from "react-bootstrap-icons"

import UniqueId from "../../lib/unique-id"
import Environment from "../../lib/environment"
import Privilege from "../../lib/project-privilege"

import DomainSelectModal from "../complexes/domain-select-modal"
import ProjectCreateModal from "../complexes/project-create-modal"
import ProjectSelectModal from "../complexes/project-select-modal"
import StatsUploadModal from "../complexes/stats-upload-modal"
import StatsSelectModal from "../complexes/stats-select-modal"
import CounterSelectModal from "../complexes/counter-select-modal"
import CounterDeleteModal from "../complexes/counter-delete-modal"

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
  stats           : string,
  counter         : string,
  onChangeDomain  : (domainName: string) => void,
  onChangeProject : (projectName: string) => void,
  onChangeStats   : (statsId: string) => void,
  onChangeCounter : (counters: string) => void
}

const ProjectNavigator = React.memo<ProjectNavigatorProps>(({
  privilege       = "none",
  domains         = "public,private",
  domain          = "",
  project         = "",
  stats           = "",
  counter         = "",
  onChangeDomain  = undefined,
  onChangeProject = undefined,
  onChangeStats   = undefined,
  onChangeCounter = undefined
}) => {
  const [ignored,       forceUpdate]       = useReducer(x => x + 1, 0)
  const [reloadProject, updateProjectList] = useReducer(x => x + 1, 0)
  const [reloadStats,   updateStatsList]   = useReducer(x => x + 1, 0)

  const id = useRef({
    domainSelect  : "modal-" + UniqueId(),
    projectCreate : "modal-" + UniqueId(),
    projectSelect : "modal-" + UniqueId(),
    statsUpload   : "modal-" + UniqueId(),
    statsSelect   : "modal-" + UniqueId(),
    counterSelect : "modal-" + UniqueId(),
    counterDelete : "modal-" + UniqueId()
  })

  const data = useRef({
    action    : "open",
    statsName : ""
  })

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
        onChangeProject("")
      }
    }
  }, [project, onChangeProject])

  const handleChangeStats = useCallback((statsId: string, statsName: string) => {
    if (data.current.action === "open") {
      data.current.statsName = statsName
      if (onChangeStats) {
        onChangeStats(statsId)
      }
    }
    if ((data.current.action === "delete") && (statsId === stats)) {
      data.current.statsName = ""
      if (onChangeStats) {
        onChangeStats("")
      }
    }
  }, [stats, onChangeStats])

  const handleUpdateStatsName = useCallback((statsName: string) => {
    data.current.statsName = statsName
    forceUpdate()
  } , [true])

  const handleSelectCounter = useCallback((cntr: string) => {
    if (onChangeCounter) {
      onChangeCounter(counter ? `${ counter },${ cntr }` : cntr)
    }
  }, [counter, onChangeCounter])

  const handleDeleteCounter = useCallback((cntr: string) => {
    if (onChangeCounter) {
      onChangeCounter(counter ? counter.split(",").filter((cnt: string) => (cnt !== cntr)).join(",") : "")
    }
  }, [counter, onChangeCounter])

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

  const handleClickOpenStats = useCallback(() => {
    data.current.action = "open"
    updateStatsList()
  }, [true])

  const handleClickDeleteStats = useCallback(() => {
    data.current.action = "delete"
    updateStatsList()
  }, [true])

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
      <StatsUploadModal
        id={ id.current.statsUpload }
        domain={ domain }
        project={ project }
        onSubmit={ handleChangeStats }
      />
      <StatsSelectModal
        id={ id.current.statsSelect }
        domain={ domain }
        project={ project }
        stats={ stats }
        action={ data.current.action }
        reload={ reloadStats }
        onSubmit={ handleChangeStats }
        onUpdate={ handleUpdateStatsName }
      />
      <CounterSelectModal
        id={ id.current.counterSelect }
        domain={ domain }
        project={ project }
        stats={ stats }
        counter={ counter }
        onSubmit={ handleSelectCounter }
      />
      <CounterDeleteModal
        id={ id.current.counterDelete }
        counter={ counter }
        onSubmit={ handleDeleteCounter }
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
              { !stats &&
                <>
                  <Button
                    label="Upload Stats"
                    LIcon={ JournalArrowUp }
                    color="info"
                    disabled={ !domain || !project || !Privilege.isStatsUploadable(privilege, domain) }
                    toggle="modal"
                    target={ id.current.statsUpload }
                    onClick={ handleClickOpenStats }
                  />
                  <Dot />
                </>
              }
              <Button
                label={ (stats && data.current.statsName) || "Select Stats" }
                LIcon={ (stats && data.current.statsName) ? JournalCheck : Journal }
                color={ (stats && data.current.statsName) ? "success" : "secondary" }
                disabled={ !domain || !project || !Privilege.isStatsOpenable(privilege, domain) }
                toggle="modal"
                target={ id.current.statsSelect }
                onClick={ handleClickOpenStats }
              />
            </div>
          </>
        }
        { project && stats &&
          <>
            <CaretRightFill />
            <div className="borderable">
              <Button
                label="Select Counter"
                LIcon={ NodePlus }
                color="info"
                disabled={ !domain || !project || !stats || (!!counter && counter.split(",").length > 4) }
                toggle="modal"
                target={ id.current.counterSelect }
              />
              <Dot />
              <Button
                label="Delete Counter"
                LIcon={ NodeMinus }
                color="secondary"
                disabled={ !domain || !project || !stats || (!counter || counter.split(",").length === 0) }
                toggle="modal"
                target={ id.current.counterDelete }
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
                key="stats-header"
                label="Stats Operations"
              />,
              <DropdownItem
                key="upload-stats"
                label="Upload"
                LIcon={ JournalArrowUp }
                disabled={ !domain || !project || !Privilege.isStatsUploadable(privilege, domain) }
                toggle="modal"
                target={ id.current.statsUpload }
              />,
              <DropdownItem
                key="delete-stats"
                label="Delete"
                LIcon={ JournalX }
                disabled={ !domain || !project || !Privilege.isStatsDeletable(privilege, domain) }
                toggle="modal"
                target={ id.current.statsSelect }
                onClick={ handleClickDeleteStats }
              />,
              <DropdownDivider key="divider-2" />,
              <DropdownHeader
                key="advanced-header"
                label="Advanced Operations"
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
