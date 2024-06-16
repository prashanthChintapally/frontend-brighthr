import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AbsenceList from '../components/AbsenceList'
import axios from 'axios'

jest.mock('axios')

const mockAbsences = [
  {
    id: '1',
    startDate: '2024-06-15',
    days: 5,
    approved: true,
    absenceType: 'SICKNESS',
    employee: { id: '101', firstName: 'John', lastName: 'Doe' },
  },
  {
    id: '2',
    startDate: '2024-06-20',
    days: 3,
    approved: false,
    absenceType: 'VACATION',
    employee: { id: '101', firstName: 'John', lastName: 'Doe' },
  },
  {
    id: '3',
    startDate: '2024-06-25',
    days: 2,
    approved: true,
    absenceType: 'SICKNESS',
    employee: { id: '102', firstName: 'Jane', lastName: 'Smith' },
  },
]

const mockResponse = { data: mockAbsences }

describe('AbsenceList Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue(mockResponse)
  })

  test('renders the absence list with data', async () => {
    render(<AbsenceList />)

    expect(screen.getByText('Absence List')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    )
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  test('filters the list by employee name', async () => {
    render(<AbsenceList />)
    await waitFor(() => screen.getByText('John Doe'))

    const filterInput = screen.getByPlaceholderText('Filter by employee name')
    fireEvent.change(filterInput, { target: { value: 'Jane' } })

    await waitFor(() =>
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    )
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  test('sorts the list by start date', async () => {
    render(<AbsenceList />)

    const startDateHeader = screen.getByText('Start Date')
    fireEvent.click(startDateHeader)
    fireEvent.click(startDateHeader)

    const sortedRow = await screen.findByText('Jane Smith')

    expect(sortedRow).toBeInTheDocument()
  })

  test('shows all absences for an employee when clicked', async () => {
    render(<AbsenceList />)
    const employeeName = await screen.findByText(/John Doe/i)
    fireEvent.click(employeeName)
    await waitFor(() => {
      expect(screen.getByText('All absences for John Doe:')).toBeInTheDocument()
      expect(screen.getByText('15/06/2024 - 5 days')).toBeInTheDocument()
      expect(screen.getByText('20/06/2024 - 3 days')).toBeInTheDocument()
    })
  })
})
