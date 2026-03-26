import { pdf } from '@react-pdf/renderer'
import CvDocument from '../components/CvPdf'

export async function exportToPdf(data, template, filename) {
  const blob = await pdf(<CvDocument data={data} template={template} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
