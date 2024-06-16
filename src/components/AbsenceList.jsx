// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

// const AbsenceList = () => {
//   const [absences, setAbsences] = useState([]);
//   const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'ascending' });
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [filter, setFilter] = useState('');

//   useEffect(() => {
//     fetchAbsences();
//   }, []);

//   const fetchAbsences = async () => {
//     try {
//       const response = await axios.get('https://front-end-kata.brighthr.workers.dev/api/absences');
//       const absencesWithConflicts = markConflicts(response.data);
//       setAbsences(absencesWithConflicts);
//     } catch (error) {
//       console.error('Error fetching absences:', error);
//     }
//   };

//   const markConflicts = (absences) => {
//     const employeeAbsences = {};

//     //group absences by employee ID
//     absences.forEach((absence) => {
//       const employeeId = absence.employee.id;
//       if (!employeeAbsences[employeeId]) {
//         employeeAbsences[employeeId] = [];
//       }
//       employeeAbsences[employeeId].push(absence);
//     });

//     //conflicts within each employee's absences
//     Object.values(employeeAbsences).forEach((employeeAbsenceList) => {
//       for (let i = 0; i < employeeAbsenceList.length; i++) {
//         let conflictReasons = [];
//         const startDateA = new Date(employeeAbsenceList[i].startDate);
//         const endDateA = new Date(startDateA);
//         endDateA.setDate(endDateA.getDate() + employeeAbsenceList[i].days);

//         //conflicts with other absences
//         for (let j = 0; j < employeeAbsenceList.length; j++) {
//           if (i !== j) {
//             const startDateB = new Date(employeeAbsenceList[j].startDate);
//             const endDateB = new Date(startDateB);
//             endDateB.setDate(endDateB.getDate() + employeeAbsenceList[j].days);

//             if (
//               (startDateA <= endDateB && endDateA >= startDateB) || // Overlapping
//               (startDateB <= endDateA && endDateB >= startDateA)    // Overlapping
//             ) {
//               conflictReasons.push('Overlapping absences');
//               break;
//             }
//           }
//         }

//         // check for weekends
//         if (includesWeekend(startDateA, employeeAbsenceList[i].days)) {
//           conflictReasons.push('Includes weekend');
//         }

//         // check if approved and days is zero
//         if (employeeAbsenceList[i].days === 0 && employeeAbsenceList[i].approved) {
//           conflictReasons.push('Approved absence with zero days');
//         }

//         employeeAbsenceList[i].conflictReasons = conflictReasons;
//       }
//     });

//     //flatten the absences array
//     return Object.values(employeeAbsences).flat();
//   };

//   const includesWeekend = (startDate, days) => {
//     for (let i = 0; i < days; i++) {
//       const currentDate = new Date(startDate);
//       currentDate.setDate(currentDate.getDate() + i);
//       const dayOfWeek = currentDate.getDay();
//       if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday = 0, Saturday = 6
//         return true;
//       }
//     }
//     return false;
//   };

//   const getEmployeeName = (employee) => {
//     return `${employee.firstName} ${employee.lastName}`;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
//   };

//   const getAbsenceDuration = (absence) => {
//     if (absence.days !== undefined) {
//       return `${absence.days} day${absence.days !== 1 ? 's' : ''}`;
//     }
//     return 'Unknown duration';
//   };

//   const requestSort = (key) => {
//     let direction = 'ascending';
//     if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//       direction = 'descending';
//     }
//     setSortConfig({ key, direction });
//   };

//   const handleEmployeeClick = (employee) => {
//     setSelectedEmployee(selectedEmployee && selectedEmployee.id === employee.id ? null : employee);
//   };

//   const SortIcon = ({ column }) => {
//     if (sortConfig.key !== column) return null;
//     return sortConfig.direction === 'ascending' ? (
//       <ChevronUpIcon className="w-5 h-5 inline" />
//     ) : (
//       <ChevronDownIcon className="w-5 h-5 inline" />
//     );
//   };

//   const sortedAbsences = React.useMemo(() => {
//     let sortableAbsences = [...absences];
//     if (sortConfig.key) {
//       sortableAbsences.sort((a, b) => {
//         if (sortConfig.key === 'employee') {
//           const aName = getEmployeeName(a.employee);
//           const bName = getEmployeeName(b.employee);
//           return sortConfig.direction === 'ascending' ? aName.localeCompare(bName) : bName.localeCompare(aName);
//         }
//         if (sortConfig.key === 'days') {
//           return sortConfig.direction === 'ascending' ? a.days - b.days : b.days - a.days;
//         }
//         if (a[sortConfig.key] < b[sortConfig.key]) {
//           return sortConfig.direction === 'ascending' ? -1 : 1;
//         }
//         if (a[sortConfig.key] > b[sortConfig.key]) {
//           return sortConfig.direction === 'ascending' ? 1 : -1;
//         }
//         return 0;
//       });
//     }
//     return sortableAbsences;
//   }, [absences, sortConfig]);

//   //group absences by employee for rendering
//   const groupedAbsences = sortedAbsences.reduce((acc, absence) => {
//     const employeeId = absence.employee.id;
//     if (!acc[employeeId]) {
//       acc[employeeId] = {
//         employee: absence.employee,
//         absences: [],
//       };
//     }
//     acc[employeeId].absences.push(absence);
//     return acc;
//   }, {});

//   const filteredAbsences = Object.values(groupedAbsences).filter((group) =>
//     getEmployeeName(group.employee).toLowerCase().includes(filter.toLowerCase())
//   );

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Absence List</h1>
//       <p>Click to reveal Jersey Number</p>
//       <input
//         type="text"
//         placeholder="Filter by employee name"
//         value={filter}
//         onChange={(e) => setFilter(e.target.value)}
//         className="mb-4 p-2 border"
//       />
//       <table className="min-w-full bg-white">
//         <thead>
//           <tr>
//             <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('startDate')}>
//               Start Date <SortIcon column="startDate" />
//             </th>
//             <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('days')}>
//               Duration <SortIcon column="days" />
//             </th>
//             <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('employee')}>
//               Employee Name <SortIcon column="employee" />
//             </th>
//             <th className="px-4 py-2">Status</th>
//             <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('absenceType')}>
//               Absence Type <SortIcon column="absenceType" />
//             </th>
//             <th className="px-4 py-2">Conflicts</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredAbsences.map((group) => (
//             <React.Fragment key={group.employee.id}>
//               <tr className={`${group.absences.some(a => a.conflictReasons.length > 0) ? 'bg-red-100' : ''} hover:bg-gray-100`}>
//                 <td className="border px-4 py-2">{formatDate(group.absences[0].startDate)}</td>
//                 <td className="border px-4 py-2">{getAbsenceDuration(group.absences[0])}</td>
//                 <td
//                   className="border px-4 py-2 cursor-pointer text-blue-600 hover:underline"
//                   onClick={() => handleEmployeeClick(group.employee)}
//                 >
//                   {getEmployeeName(group.employee)}
//                 </td>
//                 <td className="border px-4 py-2">{group.absences[0].approved ? 'Approved' : 'Pending'}</td>
//                 <td className="border px-4 py-2">{group.absences[0].absenceType.replace('_', ' ').toLowerCase()}</td>
//                 <td className="border px-4 py-2">{group.absences.some(a => a.conflictReasons.length > 0) ? 'Yes' : 'No'}</td>
//               </tr>
//               {selectedEmployee && selectedEmployee.id === group.employee.id && (
//                 <tr>
//                   <td colSpan={6} className="border px-4 py-2 bg-gray-50">
//                     <p className="font-bold">All absences for {getEmployeeName(group.employee)}:</p>
//                     <ul className="list-disc list-inside">
//                       {group.absences.map((a) => (
//                         <li key={a.id} className="my-2">
//                           {formatDate(a.startDate)} - {getAbsenceDuration(a)}
//                           {a.conflictReasons.length > 0 && (
//                             <span className="text-red-500 ml-2">
//                               Conflicts: {a.conflictReasons.join(', ')}
//                             </span>
//                           )}
//                         </li>
//                       ))}
//                     </ul>
//                   </td>
//                 </tr>
//               )}
//             </React.Fragment>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default AbsenceList;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

const AbsenceList = () => {
  const [absences, setAbsences] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'ascending' });
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      const response = await axios.get('https://front-end-kata.brighthr.workers.dev/api/absences');
      const absencesWithConflicts = await fetchAndMarkConflicts(response.data);
      setAbsences(absencesWithConflicts);
    } catch (error) {
      console.error('Error fetching absences:', error);
    }
  };

  const fetchAndMarkConflicts = async (absences) => {
    const absenceConflictPromises = absences.map(async (absence) => {
      try {
        const response = await axios.get(`https://front-end-kata.brighthr.workers.dev/api/conflict/${absence.id}`);
        absence.hasConflict = response.data.conflicts;
      } catch (error) {
        console.error('Error fetching conflict data:', error);
        absence.hasConflict = false;
      }
      return absence;
    });
    return Promise.all(absenceConflictPromises);
  };

  const getEmployeeName = (employee) => {
    return `${employee.firstName} ${employee.lastName}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const getAbsenceDuration = (absence) => {
    if (absence.days !== undefined) {
      return `${absence.days} day${absence.days !== 1 ? 's' : ''}`;
    }
    return 'Unknown duration';
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleEmployeeClick = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'ascending' ? (
      <ChevronUpIcon className="w-5 h-5 inline" />
    ) : (
      <ChevronDownIcon className="w-5 h-5 inline" />
    );
  };

  const sortedAbsences = React.useMemo(() => {
    let sortableAbsences = [...absences];
    if (sortConfig.key) {
      sortableAbsences.sort((a, b) => {
        if (sortConfig.key === 'employee') {
          const aName = getEmployeeName(a.employee);
          const bName = getEmployeeName(b.employee);
          return sortConfig.direction === 'ascending' ? aName.localeCompare(bName) : bName.localeCompare(aName);
        }
        if (sortConfig.key === 'days') {
          return sortConfig.direction === 'ascending' ? a.days - b.days : b.days - a.days;
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableAbsences;
  }, [absences, sortConfig]);

  //group absences by employee for rendering
  const groupedAbsences = sortedAbsences.reduce((acc, absence) => {
    const employeeId = absence.employee.id;
    if (!acc[employeeId]) {
      acc[employeeId] = {
        employee: absence.employee,
        absences: [],
      };
    }
    acc[employeeId].absences.push(absence);
    return acc;
  }, {});

  const filteredAbsences = Object.values(groupedAbsences).filter((group) =>
    getEmployeeName(group.employee).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Absence List</h1>
      <input
        type="text"
        placeholder="Filter by employee name"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 p-2 border"
      />
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('startDate')}>
              Start Date <SortIcon column="startDate" />
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('days')}>
              Duration <SortIcon column="days" />
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('employee')}>
              Employee Name <SortIcon column="employee" />
            </th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => requestSort('absenceType')}>
              Absence Type <SortIcon column="absenceType" />
            </th>
            <th className="px-4 py-2">Conflicts</th>
          </tr>
        </thead>
        <tbody>
          {filteredAbsences.map((group) => (
            <React.Fragment key={group.employee.id}>
              <tr
                className={`${
                  group.absences.some(a => a.hasConflict) ? 'bg-red-100' : ''
                } hover:bg-gray-100`}
                onClick={() => handleEmployeeClick(group.employee.id)}
              >
                <td className="border px-4 py-2">
                  {group.absences.map(absence => formatDate(absence.startDate)).join(', ')}
                </td>
                <td className="border px-4 py-2">{getAbsenceDuration(group.absences[0])}</td>
                <td className="border px-4 py-2 cursor-pointer text-blue-600 hover:underline">
                  {getEmployeeName(group.employee)}
                </td>
                <td className="border px-4 py-2">{group.absences[0].approved ? 'Approved' : 'Pending'}</td>
                <td className="border px-4 py-2">{group.absences[0].absenceType.replace('_', ' ').toLowerCase()}</td>
                <td className="border px-4 py-2">{group.absences.some(a => a.hasConflict) ? 'Yes' : 'No'}</td>
              </tr>
              {expandedEmployee === group.employee.id && (
                <tr>
                  <td colSpan={6} className="border px-4 py-2 bg-gray-50">
                    <p className="font-bold">All absences for {getEmployeeName(group.employee)}:</p>
                    <ul className="list-disc list-inside">
                      {group.absences.map((a) => (
                        <li key={a.id} className="my-2">
                          {formatDate(a.startDate)} - {getAbsenceDuration(a)}
                          {a.hasConflict && (
                            <span className="text-red-500 ml-2">
                              Conflicts
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AbsenceList;






