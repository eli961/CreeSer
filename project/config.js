/* ============================================================
   Cree Ser — CONFIGURACIÓN DE CONTENIDO
   ------------------------------------------------------------
   Este archivo es tu "configurador" provisional.
   Edita aquí los temas, ponentes, fechas y avisos.
   (En la versión productiva esto vivirá en un panel de
   administración con base de datos.)
   ============================================================ */
window.CREESER_CONFIG = {

  ciclo: { nombre: "Ciclo 5787", inicio: "2026-08-01", fin: "2027-07-31" },

  /* Dos programas:
     • Mañanas: Lunes y Miércoles, DOS clases cada día (11:30 y 12:40). Toman las dos.
     • Tardes: solo Miércoles, UNA clase a las 7:30 pm.
     La inscripción pregunta a cuál programa entrar. */
  sesiones: [
    { id: "manana", nombre: "Mañanas", dias: [1, 3], horas: ["11:30 – 12:30", "12:40 – 1:40"], horaCorta: "11:30 y 12:40" },
    { id: "tarde",  nombre: "Tardes",  dias: [3],    horas: ["7:30 – 8:30 pm"],                 horaCorta: "7:30 pm" }
  ],

  /* Lectura en vivo del Google Sheet (producción).
     El sitio leerá estas pestañas como CSV y actualizará el calendario solo.
     Requiere que el Sheet esté compartido como "Cualquiera con el enlace: Lector". */
  sheet: {
    id: "1yBk7Yjwk5LbWiAzi92eT_Es4cIUtqkCm_nYZaW4Yr0k",
    pestanas: [
      { nombres: ["Calendario Mananas", "Calendario Mañanas", "Mañanas", "Mananas"], programa: "manana" },
      { nombres: ["Calendario Tardes", "Tardes"], programa: "tarde" }
    ]
  },

  /* Fechas del calendario hebreo 5787 (reales).  Al pasar el mouse muestran el jag.
     Son INDEPENDIENTES de las clases: en el sheet, un tema "Rosh Hashaná" es la
     clase PREVIA a la festividad, no la fecha del jag. */
  fechasImportantes: {
    "2026-09-12": "Rosh Hashaná",
    "2026-09-13": "Rosh Hashaná · 2º día",
    "2026-09-21": "Yom Kipur",
    "2026-09-26": "Sucot",
    "2026-10-03": "Sheminí Atzéret",
    "2026-10-04": "Simjat Torá",
    "2026-12-05": "Januká · 1er día",
    "2027-01-23": "Tu BiShvat",
    "2027-03-23": "Purim",
    "2027-04-22": "Pésaj · 1er día",
    "2027-05-25": "Lag BaOmer",
    "2027-06-11": "Shavuot",
    "2027-07-14": "Fin de ciclo"
  },

  /* Clases con tema/ponente.  clave: "YYYY-MM-DD".
     Cada programa es un ARREGLO de clases (Mañanas tiene 2 por día; Tardes 1).
     En producción esto se sobre-escribe con lo que lea del Google Sheet. */
  clases: {
    "2026-08-24": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2026-08-26": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2026-08-31": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2026-09-02": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2026-09-07": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2026-09-09": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2026-09-14": {manana:[{tema:"Aseret Yeme Teshuva",ponente:""},{tema:"",ponente:""}]},
    "2026-09-16": {manana:[{tema:"Aseret Yeme Teshuva",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"Aseret Yeme Teshuva",ponente:""}]},
    "2026-09-23": {manana:[{tema:"Sukkkot",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"Sukkkot",ponente:""}]},
    "2026-10-05": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2026-10-07": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2026-10-12": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2026-10-14": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2026-10-19": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2026-10-21": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2026-10-26": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2026-10-28": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2026-11-02": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2026-11-04": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2026-11-09": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2026-11-11": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2026-11-16": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2026-11-18": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2026-11-23": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2026-11-25": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2026-11-30": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2026-12-02": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2026-12-07": {manana:[{tema:"Januca",ponente:""},{tema:"",ponente:""}]},
    "2026-12-09": {manana:[{tema:"Januca",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"Januca",ponente:""}]},
    "2026-12-14": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2026-12-16": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-01-04": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-01-06": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-01-11": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-01-13": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-01-18": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-01-20": {manana:[{tema:"Tu Bishbat",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"Tu Bishbat",ponente:""}]},
    "2027-02-01": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-02-03": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-02-08": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-02-10": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-02-15": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-02-17": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-02-22": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-02-24": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-03-01": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-03-03": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-03-08": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-03-10": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-03-15": {manana:[{tema:"Purim",ponente:""},{tema:"",ponente:""}]},
    "2027-03-17": {manana:[{tema:"Purim",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"Purim",ponente:""}]},
    "2027-03-29": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-03-31": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-04-05": {manana:[{tema:"Pesaj",ponente:""},{tema:"",ponente:""}]},
    "2027-04-07": {manana:[{tema:"Pesaj",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"Pesaj",ponente:""}]},
    "2027-04-12": {manana:[{tema:"Pesaj",ponente:""},{tema:"",ponente:""}]},
    "2027-04-14": {manana:[{tema:"Pesaj",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"Pesaj",ponente:""}]},
    "2027-05-03": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-05-05": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-05-10": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-05-12": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-05-17": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-05-19": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-05-24": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-05-26": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-05-31": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-06-02": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-06-07": {manana:[{tema:"Shabuot",ponente:""},{tema:"",ponente:""}]},
    "2027-06-09": {manana:[{tema:"Shabuot",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"Shabuot",ponente:""}]},
    "2027-06-14": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-06-16": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-06-21": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-06-23": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-06-28": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-06-30": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-07-05": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-07-07": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]},
    "2027-07-12": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}]},
    "2027-07-14": {manana:[{tema:"",ponente:""},{tema:"",ponente:""}], tarde:[{tema:"",ponente:""}]}
  },

  /* Próximas clases destacadas (se muestran en el panel lateral del calendario).
     Si lo dejas vacío, el sitio toma automáticamente las próximas del calendario. */
  destacadas: [],

  /* Avisos (lo más reciente arriba) */
  avisos: [
    { fecha:"14 ago", titulo:"Abren las inscripciones del ciclo 5787", texto:"Reserva tu lugar en Mañanas o Tardes. Cupo limitado por programa.", color:"rose", icon:"star" },
    { fecha:"10 ago", titulo:"Dos programas disponibles", texto:"Mañanas: Lun y Mié (dos clases, 11:30 y 12:40). Tardes: solo Mié 7:30 pm.", color:"teal", icon:"clock" },
    { fecha:"6 ago",  titulo:"Calendario anual publicado", texto:"Ya puedes ver todas las fechas del ciclo, de agosto a julio, con sus jaguim.", color:"gold", icon:"calendar" }
  ]
};
