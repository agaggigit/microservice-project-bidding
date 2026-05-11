const projectService = require('../services/project.service')

const sendErrorResponse = (res, error) => {
  if (error.statusCode === 400) {
    return res.status(400).json({
      message: error.message,
      errors: error.errors || []
    })
  }

  if (error.statusCode === 404) {
    return res.status(404).json({
      message: error.message
    })
  }

  if (error.code === '23503') {
    return res.status(409).json({
      message: 'Project data conflicts with existing records'
    })
  }

  console.error(error)

  return res.status(500).json({
    message: 'Internal server error'
  })
}

const createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(req.body)

    return res.status(201).json({
      message: 'Project created successfully',
      data: project
    })
  } catch (error) {
    return sendErrorResponse(res, error)
  }
}

const getProjects = async (req, res) => {
  try {
    const projects = await projectService.getProjects()

    return res.status(200).json({
      message: 'Projects retrieved successfully',
      data: projects
    })
  } catch (error) {
    return sendErrorResponse(res, error)
  }
}

const getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id)

    return res.status(200).json({
      message: 'Project retrieved successfully',
      data: project
    })
  } catch (error) {
    return sendErrorResponse(res, error)
  }
}

const updateProject = async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body)

    return res.status(200).json({
      message: 'Project updated successfully',
      data: project
    })
  } catch (error) {
    return sendErrorResponse(res, error)
  }
}

const deleteProject = async (req, res) => {
  try {
    const project = await projectService.deleteProject(req.params.id)

    return res.status(200).json({
      message: 'Project deleted successfully',
      data: project
    })
  } catch (error) {
    return sendErrorResponse(res, error)
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
}
