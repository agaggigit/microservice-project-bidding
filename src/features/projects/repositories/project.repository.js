const db = require('../../../config/db')

const create = async (projectData) => {
  const sql = `
    INSERT INTO proyek (
      mitra_id,
      judul_proyek,
      deskripsi_proyek,
      requirements,
      kuota_maksimal,
      status_proyek,
      budget_awal
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `

  const values = [
    projectData.mitra_id,
    projectData.judul_proyek,
    projectData.deskripsi_proyek,
    projectData.requirements,
    projectData.kuota_maksimal,
    projectData.status_proyek,
    projectData.budget_awal
  ]

  const result = await db.query(sql, values)
  return result.rows[0]
}

const findAll = async () => {
  const sql = `
    SELECT *
    FROM proyek
    ORDER BY created_at DESC, proyek_id DESC
  `

  const result = await db.query(sql)
  return result.rows
}

const findById = async (id) => {
  const sql = `
    SELECT *
    FROM proyek
    WHERE proyek_id = $1
  `

  const result = await db.query(sql, [id])
  return result.rows[0]
}

const update = async (id, projectData) => {
  const sql = `
    UPDATE proyek
    SET
      judul_proyek = $1,
      deskripsi_proyek = $2,
      requirements = $3,
      kuota_maksimal = $4,
      status_proyek = $5
    WHERE proyek_id = $6
    RETURNING *
  `

  const values = [
    projectData.judul_proyek,
    projectData.deskripsi_proyek,
    projectData.requirements,
    projectData.kuota_maksimal,
    projectData.status_proyek,
    id
  ]

  const result = await db.query(sql, values)
  return result.rows[0]
}

const remove = async (id) => {
  const sql = `
    DELETE FROM proyek
    WHERE proyek_id = $1
    RETURNING *
  `

  const result = await db.query(sql, [id])
  return result.rows[0]
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove
}
