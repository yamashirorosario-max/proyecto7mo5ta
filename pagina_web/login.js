// Claves centralizadas para el almacenamiento local del navegador.
const STORAGE_KEYS = {
  session: "asistencias.session",
  students: "asistencias.students",
  attendance: "asistencias.attendance",
  selectedDate: "asistencias.selectedDate"
};

// Credenciales temporales para acceder al panel principal.
const DEFAULT_ADMIN_CREDENTIALS = {
  username: "admin",
  email: "admin@gmail.com",
  password: "adminsupersecreto1234"
};

// Estados válidos de asistencia para taller y curricular.
const ATTENDANCE_OPTIONS = ["presente", "ausente", "media"];

// Datos de ejemplo temporales.
// Cuando la base de datos esté disponible, esta colección debe dejar de usarse.
const SAMPLE_STUDENTS = [
  { nombre: "BRUNO", apellido: "PANIGO", dni: "10000001", curso: "7A", turno: "Manana" },
  { nombre: "PAOLA", apellido: "RAMOS", dni: "10000002", curso: "7A", turno: "Manana" },
  { nombre: "SOFIA", apellido: "VILLA MIEL", dni: "10000003", curso: "7A", turno: "Manana" },
  { nombre: "RAMIRO", apellido: "LEYES", dni: "10000004", curso: "7A", turno: "Manana" },
  { nombre: "JUNIOR", apellido: "ROSALES", dni: "10000005", curso: "7A", turno: "Manana" },
  { nombre: "JUAN CRUZ", apellido: "TROUBUL", dni: "10000006", curso: "7A", turno: "Manana" },
  { nombre: "ELIAS", apellido: "VALECILLOS", dni: "10000007", curso: "7A", turno: "Manana" },
  { nombre: "THOMAS", apellido: "", dni: "10000008", curso: "7A", turno: "Manana" },
  { nombre: "EMILIANO", apellido: "", dni: "10000009", curso: "7A", turno: "Manana" },
  { nombre: "JUAN", apellido: "", dni: "10000010", curso: "7A", turno: "Manana" },
  { nombre: "PABLO", apellido: "", dni: "10000011", curso: "7A", turno: "Manana" }
];

// Asistencias de ejemplo alineadas con los alumnos temporales.
const SAMPLE_ATTENDANCE = [
  { tallerEstado: "ausente", tallerHoraLlegada: "", curricular: "ausente", horaLlegada: "", justificado: "no" },
  { tallerEstado: "ausente", tallerHoraLlegada: "", curricular: "ausente", horaLlegada: "", justificado: "no" },
  { tallerEstado: "presente", tallerHoraLlegada: "07:25", curricular: "presente", horaLlegada: "07:30", justificado: "no" },
  { tallerEstado: "presente", tallerHoraLlegada: "07:28", curricular: "presente", horaLlegada: "07:35", justificado: "no" },
  { tallerEstado: "media", tallerHoraLlegada: "07:42", curricular: "presente", horaLlegada: "07:40", justificado: "no" },
  { tallerEstado: "presente", tallerHoraLlegada: "07:31", curricular: "presente", horaLlegada: "07:42", justificado: "no" },
  { tallerEstado: "presente", tallerHoraLlegada: "07:34", curricular: "presente", horaLlegada: "07:45", justificado: "no" },
  { tallerEstado: "media", tallerHoraLlegada: "07:50", curricular: "presente", horaLlegada: "07:48", justificado: "no" },
  { tallerEstado: "presente", tallerHoraLlegada: "07:36", curricular: "presente", horaLlegada: "07:50", justificado: "no" },
  { tallerEstado: "presente", tallerHoraLlegada: "07:38", curricular: "media", horaLlegada: "07:53", justificado: "no" },
  { tallerEstado: "presente", tallerHoraLlegada: "07:40", curricular: "presente", horaLlegada: "07:55", justificado: "no" }
];

// Inicialización general según la página actual.
document.addEventListener("DOMContentLoaded", () => {
  bootstrapData();

  if (document.getElementById("login-form")) {
    initLoginPage();
  }

  if (document.getElementById("registro-form")) {
    initRegistroPage();
  }

  if (document.querySelector(".table-card table")) {
    initAsistenciaPage();
  }
});

// Prepara estudiantes, asistencias y fecha base para que la interfaz siempre tenga datos válidos.
function bootstrapData() {
  const students = resolveStudentCatalog();
  writeStorage(STORAGE_KEYS.students, students);

  const todayKey = getCurrentBusinessDateKey();
  const attendanceStore = normalizeAttendanceStore(readStorage(STORAGE_KEYS.attendance), todayKey, students);
  writeStorage(STORAGE_KEYS.attendance, attendanceStore);

  if (!readStorage(STORAGE_KEYS.selectedDate)) {
    writeStorage(STORAGE_KEYS.selectedDate, todayKey);
  }
}

// Lógica del formulario de inicio de sesión.
function initLoginPage() {
  const form = document.getElementById("login-form");
  const usuarioInput = document.getElementById("login-usuario");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const rememberCheckbox = document.getElementById("rem");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const usuario = usuarioInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!usuario || !email || !password) {
      showFormMessage(form, "Completa usuario, email y contrasena para iniciar sesion.", "error");
      return;
    }

    if (
      usuario !== DEFAULT_ADMIN_CREDENTIALS.username ||
      email !== DEFAULT_ADMIN_CREDENTIALS.email ||
      password !== DEFAULT_ADMIN_CREDENTIALS.password
    ) {
      showFormMessage(form, "Usuario, email o contrasena incorrectos. No se puede ingresar al panel.", "error");
      return;
    }

    writeStorage(STORAGE_KEYS.session, {
      usuario,
      email,
      remember: rememberCheckbox.checked,
      loginAt: new Date().toISOString()
    });

    showFormMessage(form, "Inicio de sesion correcto. Redirigiendo...", "success");
    window.setTimeout(() => {
      window.location.href = "asistencia.html";
    }, 600);
  });
}

// Lógica del formulario de registro de alumnos.
function initRegistroPage() {
  const form = document.getElementById("registro-form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const student = {
      nombre: document.getElementById("registro-nombre").value.trim().toUpperCase(),
      apellido: document.getElementById("registro-apellido").value.trim().toUpperCase(),
      dni: document.getElementById("registro-dni").value.trim(),
      curso: document.getElementById("registro-curso").value.trim().toUpperCase(),
      turno: document.getElementById("registro-turno").value.trim()
    };

    if (Object.values(student).some((value) => !value)) {
      showFormMessage(form, "Todos los campos del registro son obligatorios.", "error");
      return;
    }

    const students = readStorage(STORAGE_KEYS.students, []);
    const alreadyExists = students.some((savedStudent) => savedStudent.dni === student.dni);

    if (alreadyExists) {
      showFormMessage(form, "Ya existe un alumno registrado con ese DNI.", "error");
      return;
    }

    students.push(student);
    writeStorage(STORAGE_KEYS.students, students);

    const attendanceStore = readStorage(STORAGE_KEYS.attendance, {});
    Object.keys(attendanceStore).forEach((dateKey) => {
      attendanceStore[dateKey].push(buildDefaultAttendanceRecord(student.dni));
    });
    writeStorage(STORAGE_KEYS.attendance, attendanceStore);

    form.reset();
    showFormMessage(form, "Alumno registrado correctamente. Ya figura en asistencias.", "success");
  });
}

// Lógica principal de la pantalla de asistencias.
function initAsistenciaPage() {
  const session = readStorage(STORAGE_KEYS.session);
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const tableBody = document.querySelector("tbody");
  const currentDate = document.getElementById("current-date");
  const dateInput = document.getElementById("attendance-date");
  const editButton = document.getElementById("edit-button");
  const pdfButton = document.getElementById("pdf-button");
  const logoutButton = document.getElementById("logout-button");
  const cursoButton = document.getElementById("curso-button");
  const courseDropdown = document.getElementById("course-dropdown");
  const buscarButton = document.getElementById("buscar-button");
  const menuButtons = Array.from(document.querySelectorAll(".menu-btn"));
  const availableCourses = getAvailableCourses();

  let editMode = false;
  let activeFilter = "";
  let activeCourse = availableCourses[0] || "";
  let selectedDate = ensureBusinessDate(readStorage(STORAGE_KEYS.selectedDate, getCurrentBusinessDateKey()));

  writeStorage(STORAGE_KEYS.selectedDate, selectedDate);

  if (dateInput) {
    dateInput.value = selectedDate;
  }

  updateDateLabel(currentDate, selectedDate);
  ensureAttendanceForDate(selectedDate);

  // Actualiza el curso seleccionado y refresca tabla y dropdown.
  const handleCourseSelect = (course) => {
    activeCourse = course;
    setActiveMenu(menuButtons, cursoButton);
    setCourseButtonLabel(cursoButton, activeCourse);
    renderCourseDropdown(courseDropdown, activeCourse, handleCourseSelect);
    renderTable(tableBody, activeFilter, editMode, selectedDate, activeCourse);
    showPageMessage(`Curso seleccionado: ${activeCourse}.`);
    courseDropdown?.classList.remove("open");
  };

  setCourseButtonLabel(cursoButton, activeCourse);
  renderCourseDropdown(courseDropdown, activeCourse, handleCourseSelect);
  renderTable(tableBody, activeFilter, editMode, selectedDate, activeCourse);

  if (dateInput) {
    dateInput.addEventListener("change", () => {
      const requestedDate = dateInput.value || getCurrentBusinessDateKey();

      if (!isBusinessDay(requestedDate)) {
        selectedDate = ensureBusinessDate(requestedDate);
        dateInput.value = selectedDate;
        showPageMessage("Solo se pueden seleccionar dias habiles. Se ajusto la fecha automaticamente.");
      } else {
        selectedDate = requestedDate;
      }

      writeStorage(STORAGE_KEYS.selectedDate, selectedDate);
      updateDateLabel(currentDate, selectedDate);
      ensureAttendanceForDate(selectedDate);
      renderTable(tableBody, activeFilter, editMode, selectedDate, activeCourse);
    });
  }

  if (editButton) {
    editButton.addEventListener("click", () => {
      editMode = !editMode;
      editButton.textContent = editMode ? "GUARDAR EDICION" : "EDITAR";
      renderTable(tableBody, activeFilter, editMode, selectedDate, activeCourse);
      showPageMessage(editMode ? "Modo edicion activado." : "Cambios guardados para la fecha seleccionada.");
    });
  }

  if (pdfButton) {
    pdfButton.addEventListener("click", () => {
      setActiveMenu(menuButtons, pdfButton);
      generateListadoPdf(selectedDate, activeFilter, activeCourse);
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEYS.session);
      window.location.href = "login.html";
    });
  }

  if (cursoButton) {
    cursoButton.addEventListener("click", () => {
      setActiveMenu(menuButtons, cursoButton);
      courseDropdown?.classList.toggle("open");
    });
  }

  if (buscarButton) {
    buscarButton.addEventListener("click", () => {
      setActiveMenu(menuButtons, buscarButton);
      const userInput = window.prompt("Buscar por nombre, apellido, DNI, curso o turno:");
      if (userInput === null) {
        return;
      }

      activeFilter = userInput.trim();
      renderTable(tableBody, activeFilter, editMode, selectedDate, activeCourse);
      showPageMessage(activeFilter ? `Filtro aplicado: "${activeFilter}".` : "Busqueda limpiada.");
    });
  }

  // Cierra el desplegable al hacer clic fuera de él.
  document.addEventListener("click", (event) => {
    if (!courseDropdown || !cursoButton) {
      return;
    }

    const clickedInsideDropdown = courseDropdown.contains(event.target);
    const clickedButton = cursoButton.contains(event.target);

    if (!clickedInsideDropdown && !clickedButton) {
      courseDropdown.classList.remove("open");
    }
  });
}

// Construye el contenido visual de la tabla según fecha, curso y búsqueda.
function renderTable(tableBody, filterText, editMode, selectedDate, activeCourse) {
  if (!tableBody) {
    return;
  }

  const students = readStorage(STORAGE_KEYS.students, []);
  const attendanceStore = readStorage(STORAGE_KEYS.attendance, {});
  const attendanceForDate = ensureAttendanceArray(attendanceStore, selectedDate, students);
  const normalizedFilter = filterText.trim().toLowerCase();

  const rows = students
    .map((student) => ({ student, record: findAttendance(student.dni, attendanceForDate) }))
    .filter(({ student }) => {
      if (activeCourse && student.curso !== activeCourse) {
        return false;
      }

      if (!normalizedFilter) {
        return true;
      }

      const searchableText = [
        student.nombre,
        student.apellido,
        student.dni,
        student.curso,
        student.turno
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedFilter);
    })
    .map(({ student, record }) => buildRow(student, record, editMode))
    .join("");

  tableBody.innerHTML = rows || '<tr><td colspan="4">No se encontraron alumnos para la busqueda actual.</td></tr>';

  if (editMode) {
    attachEditEvents(tableBody, selectedDate);
  }
}

// Genera una fila de tabla en modo lectura o edición.
function buildRow(student, record, editMode) {
  const fullName = [student.apellido, student.nombre].filter(Boolean).join(" ").trim();
  const tallerStatus = getStatusPresentation(record.tallerEstado);
  const curricularStatus = getStatusPresentation(record.curricular);
  const tallerTimeLabel = record.tallerHoraLlegada ? `Hora: ${record.tallerHoraLlegada}` : "Hora: --:--";
  const curricularTimeLabel = record.horaLlegada ? `Hora: ${record.horaLlegada}` : "Hora: --:--";

  if (!editMode) {
    return `
      <tr data-dni="${student.dni}">
        <td>${escapeHtml(fullName)}<br><small>${escapeHtml(student.curso)} - ${escapeHtml(student.turno)}</small></td>
        <td>
          <div class="status-cell">
            <span class="status ${tallerStatus.className}">${tallerStatus.label}</span>
            <span class="arrival-time">${tallerTimeLabel}</span>
          </div>
        </td>
        <td>
          <div class="status-cell">
            <span class="status ${curricularStatus.className}">${curricularStatus.label}</span>
            <span class="arrival-time">${curricularTimeLabel}</span>
          </div>
        </td>
        <td>${renderJustification(record.justificado)}</td>
      </tr>
    `;
  }

  return `
    <tr data-dni="${student.dni}">
      <td>${escapeHtml(fullName)}<br><small>${escapeHtml(student.curso)} - ${escapeHtml(student.turno)}</small></td>
      <td>
        <div class="status-editor">
          ${buildStatusSelect("edit-taller-estado", record.tallerEstado)}
          <input type="time" class="edit-taller-hora-llegada" value="${escapeAttribute(record.tallerHoraLlegada || "")}">
        </div>
      </td>
      <td>
        <div class="status-editor">
          ${buildStatusSelect("edit-curricular", record.curricular)}
          <input type="time" class="edit-hora-llegada" value="${escapeAttribute(record.horaLlegada || "")}">
        </div>
      </td>
      <td>
        <select class="edit-justificado">
          <option value="no" ${record.justificado === "no" ? "selected" : ""}>No</option>
          <option value="si" ${record.justificado === "si" ? "selected" : ""}>Si</option>
        </select>
      </td>
    </tr>
  `;
}

// Reutiliza el mismo selector para taller y curricular.
function buildStatusSelect(className, selectedValue) {
  return `
    <select class="${className}">
      <option value="presente" ${selectedValue === "presente" ? "selected" : ""}>Presente</option>
      <option value="ausente" ${selectedValue === "ausente" ? "selected" : ""}>Ausente</option>
      <option value="media" ${selectedValue === "media" ? "selected" : ""}>1/2 presente</option>
    </select>
  `;
}

// Guarda cambios realizados sobre una fila en modo edición.
function attachEditEvents(tableBody, selectedDate) {
  tableBody.querySelectorAll("tr[data-dni]").forEach((row) => {
    const dni = row.dataset.dni;
    const tallerEstadoSelect = row.querySelector(".edit-taller-estado");
    const tallerHoraInput = row.querySelector(".edit-taller-hora-llegada");
    const curricularSelect = row.querySelector(".edit-curricular");
    const horaLlegadaInput = row.querySelector(".edit-hora-llegada");
    const justificadoSelect = row.querySelector(".edit-justificado");

    [tallerEstadoSelect, tallerHoraInput, curricularSelect, horaLlegadaInput, justificadoSelect].forEach((field) => {
      if (!field) {
        return;
      }

      field.addEventListener("change", () => {
        const attendanceStore = readStorage(STORAGE_KEYS.attendance, {});
        const students = readStorage(STORAGE_KEYS.students, []);
        const attendanceForDate = ensureAttendanceArray(attendanceStore, selectedDate, students);
        const record = findAttendance(dni, attendanceForDate);

        record.tallerEstado = normalizeAttendanceValue(tallerEstadoSelect.value);
        record.tallerHoraLlegada = tallerHoraInput.value;
        record.curricular = normalizeAttendanceValue(curricularSelect.value);
        record.horaLlegada = horaLlegadaInput.value;
        record.justificado = justificadoSelect.value === "si" ? "si" : "no";

        writeStorage(STORAGE_KEYS.attendance, attendanceStore);
      });
    });
  });
}

// Arma el registro base de asistencia para un alumno.
function buildDefaultAttendanceRecord(dni, seed = {}) {
  return {
    dni,
    tallerEstado: normalizeAttendanceValue(seed.tallerEstado || seed.taller || "ausente"),
    tallerHoraLlegada: seed.tallerHoraLlegada || "",
    curricular: normalizeAttendanceValue(seed.curricular || "ausente"),
    justificado: seed.justificado === "si" ? "si" : "no",
    horaLlegada: seed.horaLlegada || ""
  };
}

// Normaliza la estructura histórica de asistencias a un formato único por fecha.
function normalizeAttendanceStore(storedAttendance, todayKey, students) {
  if (!storedAttendance) {
    return {
      [todayKey]: students.map((student, index) =>
        buildDefaultAttendanceRecord(student.dni, SAMPLE_ATTENDANCE[index] || {})
      )
    };
  }

  if (Array.isArray(storedAttendance)) {
    return {
      [todayKey]: students.map((student, index) => {
        const current = storedAttendance.find((item) => item.dni === student.dni) || SAMPLE_ATTENDANCE[index] || {};
        return buildDefaultAttendanceRecord(student.dni, current);
      })
    };
  }

  const normalizedStore = {};

  Object.keys(storedAttendance).forEach((dateKey) => {
    normalizedStore[dateKey] = students.map((student, index) => {
      const dateArray = Array.isArray(storedAttendance[dateKey]) ? storedAttendance[dateKey] : [];
      const current = dateArray.find((item) => item.dni === student.dni) || SAMPLE_ATTENDANCE[index] || {};
      return buildDefaultAttendanceRecord(student.dni, current);
    });
  });

  if (!normalizedStore[todayKey]) {
    normalizedStore[todayKey] = students.map((student, index) =>
      buildDefaultAttendanceRecord(student.dni, SAMPLE_ATTENDANCE[index] || {})
    );
  }

  return normalizedStore;
}

// Garantiza que la fecha seleccionada tenga una lista completa de asistencias.
function ensureAttendanceForDate(dateKey) {
  const attendanceStore = readStorage(STORAGE_KEYS.attendance, {});
  const students = readStorage(STORAGE_KEYS.students, []);
  ensureAttendanceArray(attendanceStore, dateKey, students);
  writeStorage(STORAGE_KEYS.attendance, attendanceStore);
}

// Completa o corrige los registros de una fecha para todos los alumnos cargados.
function ensureAttendanceArray(attendanceStore, dateKey, students) {
  if (!Array.isArray(attendanceStore[dateKey])) {
    attendanceStore[dateKey] = [];
  }

  students.forEach((student) => {
    if (!attendanceStore[dateKey].some((item) => item.dni === student.dni)) {
      attendanceStore[dateKey].push(buildDefaultAttendanceRecord(student.dni));
    }
  });

  attendanceStore[dateKey] = attendanceStore[dateKey].map((record) => ({
    dni: record.dni,
    tallerEstado: normalizeAttendanceValue(record.tallerEstado || record.taller),
    tallerHoraLlegada: record.tallerHoraLlegada || "",
    curricular: normalizeAttendanceValue(record.curricular),
    justificado: record.justificado === "si" ? "si" : "no",
    horaLlegada: record.horaLlegada || ""
  }));

  return attendanceStore[dateKey];
}

// Busca o crea el registro de asistencia de un alumno dentro de una fecha.
function findAttendance(dni, attendanceForDate) {
  let record = attendanceForDate.find((item) => item.dni === dni);

  if (!record) {
    record = buildDefaultAttendanceRecord(dni);
    attendanceForDate.push(record);
  }

  return record;
}

// Normaliza cualquier valor de asistencia a los tres estados admitidos.
function normalizeAttendanceValue(value) {
  return ATTENDANCE_OPTIONS.includes(value) ? value : "ausente";
}

// Traduce el estado interno a etiqueta y clase visual.
function getStatusPresentation(value) {
  if (value === "presente") {
    return { label: "Presente", className: "present" };
  }

  if (value === "media") {
    return { label: "1/2 presente", className: "partial" };
  }

  return { label: "Ausente", className: "absent" };
}

// Renderiza la columna de justificado.
function renderJustification(value) {
  return value === "si" ? '<span class="green">Si</span>' : '<span class="red">No</span>';
}

// Genera una vista de impresión exclusiva del listado para guardar como PDF.
function generateListadoPdf(selectedDate, filterText, activeCourse) {
  const students = readStorage(STORAGE_KEYS.students, []);
  const attendanceStore = readStorage(STORAGE_KEYS.attendance, {});
  const attendanceForDate = ensureAttendanceArray(attendanceStore, selectedDate, students);
  const normalizedFilter = String(filterText || "").trim().toLowerCase();

  const printableRows = students
    .map((student) => ({ student, record: findAttendance(student.dni, attendanceForDate) }))
    .filter(({ student }) => {
      if (activeCourse && student.curso !== activeCourse) {
        return false;
      }

      if (!normalizedFilter) {
        return true;
      }

      const searchableText = [
        student.nombre,
        student.apellido,
        student.dni,
        student.curso,
        student.turno
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedFilter);
    })
    .map(({ student, record }) => {
      const fullName = [student.apellido, student.nombre].filter(Boolean).join(" ").trim();
      const tallerStatus = getStatusPresentation(record.tallerEstado).label;
      const curricularStatus = getStatusPresentation(record.curricular).label;
      const tallerHora = record.tallerHoraLlegada || "--:--";
      const curricularHora = record.horaLlegada || "--:--";
      const justificado = record.justificado === "si" ? "Si" : "No";

      return `
        <tr>
          <td>${escapeHtml(fullName)}</td>
          <td>${escapeHtml(student.curso)}</td>
          <td>${escapeHtml(student.turno)}</td>
          <td>${escapeHtml(tallerStatus)}</td>
          <td>${escapeHtml(tallerHora)}</td>
          <td>${escapeHtml(curricularStatus)}</td>
          <td>${escapeHtml(curricularHora)}</td>
          <td>${escapeHtml(justificado)}</td>
        </tr>
      `;
    })
    .join("");

  const printWindow = window.open("", "_blank", "width=1200,height=900");
  if (!printWindow) {
    showPageMessage("No se pudo abrir la ventana de impresion. Revisa si el navegador bloquea ventanas emergentes.");
    return;
  }

  const date = parseDateKey(selectedDate);
  const formattedDate = date.toLocaleDateString("es-AR");
  const weekday = capitalize(date.toLocaleDateString("es-AR", { weekday: "long" }));

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Listado de Asistencias</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #1a1a1a; }
        h1, h2, p { margin: 0 0 10px 0; }
        .meta { margin-bottom: 18px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td {
          border: 1px solid #cfd8e3;
          padding: 10px 8px;
          text-align: left;
          vertical-align: top;
          font-size: 13px;
          word-wrap: break-word;
        }
        th { background: #eef6fb; }
        .wide { width: 22%; }
        @page { size: A4 landscape; margin: 12mm; }
      </style>
    </head>
    <body>
      <h1>EEST N 9 - La Plata</h1>
      <h2>Listado de Asistencia</h2>
      <div class="meta">
        <p>Fecha: ${escapeHtml(weekday)} ${escapeHtml(formattedDate)}</p>
        <p>Curso: ${escapeHtml(activeCourse || "-")}</p>
        <p>${normalizedFilter ? `Filtro aplicado: ${escapeHtml(filterText)}` : "Sin filtro de busqueda"}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th class="wide">Alumno</th>
            <th>Curso</th>
            <th>Turno</th>
            <th>Asistencia taller</th>
            <th>Hora taller</th>
            <th>Asistencia curricular</th>
            <th>Hora curricular</th>
            <th>Justificado</th>
          </tr>
        </thead>
        <tbody>
          ${printableRows || '<tr><td colspan="8">No hay alumnos para imprimir con el filtro actual.</td></tr>'}
        </tbody>
      </table>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.print();
  };
}

// Dibuja el menú desplegable de cursos usando los cursos actualmente disponibles.
function renderCourseDropdown(container, activeCourse, onSelect) {
  if (!container) {
    return;
  }

  const courses = getAvailableCourses();
  container.innerHTML = courses
    .map((course) => {
      const activeClass = activeCourse === course ? "active" : "";
      return `<button type="button" class="course-option ${activeClass}" data-course="${escapeAttribute(course)}">${escapeHtml(course)}</button>`;
    })
    .join("");

  container.querySelectorAll(".course-option").forEach((button) => {
    button.addEventListener("click", () => {
      onSelect(button.dataset.course);
    });
  });
}

// Actualiza el texto del botón principal de cursos y conserva la flecha del desplegable.
function setCourseButtonLabel(button, course) {
  if (!button) {
    return;
  }

  button.textContent = `Curso: ${course || "-"} ▼`;
}

// Obtiene la lista de cursos visibles en el desplegable.
// En el futuro se puede reemplazar por cursos traídos desde base de datos.
function getAvailableCourses() {
  const students = readStorage(STORAGE_KEYS.students, []);
  const studentCourses = students
    .map((student) => String(student.curso || "").trim().toUpperCase())
    .filter(Boolean);

  return Array.from(new Set(studentCourses)).sort((a, b) =>
    a.localeCompare(b, "es", { numeric: true, sensitivity: "base" })
  );
}

// Punto único para integrar alumnos de base de datos cuando el backend esté listo.
// Mientras devuelva `null`, el sistema seguirá usando localStorage y datos de ejemplo.
function getStudentsFromDatabase() {
  return null;
}

// Determina qué catálogo de alumnos debe usar la app en este momento.
function resolveStudentCatalog() {
  const databaseStudents = getStudentsFromDatabase();

  if (Array.isArray(databaseStudents) && databaseStudents.length > 0) {
    return databaseStudents;
  }

  const storedStudents = readStorage(STORAGE_KEYS.students, null);
  if (Array.isArray(storedStudents) && storedStudents.length > 0) {
    return storedStudents;
  }

  return SAMPLE_STUDENTS;
}

// Muestra la fecha elegida de forma amigable en la parte superior.
function updateDateLabel(currentDateElement, selectedDate) {
  if (!currentDateElement) {
    return;
  }

  const date = parseDateKey(selectedDate);
  const weekday = date.toLocaleDateString("es-AR", { weekday: "long" });
  const formattedDate = date.toLocaleDateString("es-AR");
  currentDateElement.textContent = `Fecha: ${capitalize(weekday)} ${formattedDate}`;
}

// Corrige fines de semana al próximo día hábil.
function ensureBusinessDate(dateKey) {
  const parsedDate = parseDateKey(dateKey);
  const day = parsedDate.getDay();

  if (day === 0) {
    parsedDate.setDate(parsedDate.getDate() + 1);
  } else if (day === 6) {
    parsedDate.setDate(parsedDate.getDate() + 2);
  }

  return toDateKey(parsedDate);
}

// Obtiene la fecha hábil base para inicializar la pantalla.
function getCurrentBusinessDateKey() {
  return ensureBusinessDate(toDateKey(new Date()));
}

// Verifica si una fecha dada es día hábil.
function isBusinessDay(dateKey) {
  const day = parseDateKey(dateKey).getDay();
  return day >= 1 && day <= 5;
}

// Convierte una clave YYYY-MM-DD en un objeto Date local.
function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Convierte una fecha en formato YYYY-MM-DD.
function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Marca visualmente el botón de menú activo.
function setActiveMenu(buttons, activeButton) {
  buttons.forEach((button) => {
    button.classList.toggle("active", button === activeButton);
  });
}

// Muestra mensajes debajo de formularios de login y registro.
function showFormMessage(form, message, type) {
  let status = form.parentElement.querySelector(".js-status-message");

  if (!status) {
    status = document.createElement("p");
    status.className = "js-status-message";
    status.style.marginTop = "16px";
    status.style.textAlign = "center";
    status.style.fontWeight = "600";
    form.insertAdjacentElement("afterend", status);
  }

  status.textContent = message;
  status.style.color = type === "error" ? "#c0392b" : "#1f8b4c";
}

// Muestra avisos breves dentro de la pantalla principal.
function showPageMessage(message) {
  let banner = document.querySelector(".js-page-banner");

  if (!banner) {
    banner = document.createElement("div");
    banner.className = "js-page-banner";
    banner.style.background = "#e8f9fd";
    banner.style.color = "#0f5f70";
    banner.style.padding = "12px 18px";
    banner.style.borderRadius = "14px";
    banner.style.marginBottom = "18px";
    banner.style.fontWeight = "600";
    const main = document.querySelector(".main");
    if (main) {
      main.insertBefore(banner, main.firstChild);
    }
  }

  banner.textContent = message;
}

// Capitaliza la primera letra de un texto.
function capitalize(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Lee valores JSON del almacenamiento local de forma segura.
function readStorage(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    return fallback;
  }
}

// Guarda valores JSON en el almacenamiento local.
function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Escapa texto antes de insertarlo en HTML.
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Escapa texto antes de insertarlo dentro de atributos HTML.
function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
