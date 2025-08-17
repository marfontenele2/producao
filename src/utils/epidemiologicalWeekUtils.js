// 📄 ARQUIVO ATUALIZADO: src/utils/epidemiologicalWeekUtils.js

// Dados para anos próximos para consulta rápida e fallback.
// Fonte 2024: http://portalsinan.saude.gov.br/calendario-epidemiologico?layout=edit&id=174
// Fonte 2025: PDF fornecido na solicitação
const precomputedCalendars = {
  2024: [
    { week: 1, start: "2023-12-31", end: "2024-01-06" },
    // ... (restante dos dados de 2024 pode ser adicionado se necessário)
    { week: 52, start: "2024-12-22", end: "2024-12-28" },
  ],
  2025: [
    { week: 1, start: "2024-12-29", end: "2025-01-04" },
    { week: 2, start: "2025-01-05", end: "2025-01-11" },
    { week: 3, start: "2025-01-12", end: "2025-01-18" },
    { week: 4, start: "2025-01-19", end: "2025-01-25" },
    { week: 5, start: "2025-01-26", end: "2025-02-01" },
    { week: 6, start: "2025-02-02", end: "2025-02-08" },
    { week: 7, start: "2025-02-09", end: "2025-02-15" },
    { week: 8, start: "2025-02-16", end: "2025-02-22" },
    { week: 9, start: "2025-02-23", end: "2025-03-01" },
    { week: 10, start: "2025-03-02", end: "2025-03-08" },
    { week: 11, start: "2025-03-09", end: "2025-03-15" },
    { week: 12, start: "2025-03-16", end: "2025-03-22" },
    { week: 13, start: "2025-03-23", end: "2025-03-29" },
    { week: 14, start: "2025-03-30", end: "2025-04-05" },
    { week: 15, start: "2025-04-06", end: "2025-04-12" },
    { week: 16, start: "2025-04-13", end: "2025-04-19" },
    { week: 17, start: "2025-04-20", end: "2025-04-26" },
    { week: 18, start: "2025-04-27", end: "2025-05-03" },
    { week: 19, start: "2025-05-04", end: "2025-05-10" },
    { week: 20, start: "2025-05-11", end: "2025-05-17" },
    { week: 21, start: "2025-05-18", end: "2025-05-24" },
    { week: 22, start: "2025-05-25", end: "2025-05-31" },
    { week: 23, start: "2025-06-01", end: "2025-06-07" },
    { week: 24, start: "2025-06-08", end: "2025-06-14" },
    { week: 25, start: "2025-06-15", end: "2025-06-21" },
    { week: 26, start: "2025-06-22", end: "2025-06-28" },
    { week: 27, start: "2025-06-29", end: "2025-07-05" },
    { week: 28, start: "2025-07-06", end: "2025-07-12" },
    { week: 29, start: "2025-07-13", end: "2025-07-19" },
    { week: 30, start: "2025-07-20", end: "2025-07-26" },
    { week: 31, start: "2025-07-27", end: "2025-08-02" },
    { week: 32, start: "2025-08-03", end: "2025-08-09" },
    { week: 33, start: "2025-08-10", end: "2025-08-16" },
    { week: 34, start: "2025-08-17", end: "2025-08-23" },
    { week: 35, start: "2025-08-24", end: "2025-08-30" },
    { week: 36, start: "2025-08-31", end: "2025-09-06" },
    { week: 37, start: "2025-09-07", end: "2025-09-13" },
    { week: 38, start: "2025-09-14", end: "2025-09-20" },
    { week: 39, start: "2025-09-21", end: "2025-09-27" },
    { week: 40, start: "2025-09-28", end: "2025-10-04" },
    { week: 41, start: "2025-10-05", end: "2025-10-11" },
    { week: 42, start: "2025-10-12", end: "2025-10-18" },
    { week: 43, start: "2025-10-19", end: "2025-10-25" },
    { week: 44, start: "2025-10-26", end: "2025-11-01" },
    { week: 45, start: "2025-11-02", end: "2025-11-08" },
    { week: 46, start: "2025-11-09", end: "2025-11-15" },
    { week: 47, start: "2025-11-16", end: "2025-11-22" },
    { week: 48, start: "2025-11-23", end: "2025-11-29" },
    { week: 49, start: "2025-11-30", end: "2025-12-06" },
    { week: 50, start: "2025-12-07", end: "2025-12-13" },
    { week: 51, start: "2025-12-14", end: "2025-12-20" },
    { week: 52, start: "2025-12-21", end: "2025-12-27" },
    { week: 53, start: "2025-12-28", end: "2026-01-03" },
  ],
  2026: [
    { week: 1, start: "2026-01-04", end: "2026-01-10" },
    // ... (restante seria gerado dinamicamente)
  ],
};

// Cache para calendários gerados
const calendarCache = new Map();

export const epidemiologicalWeekUtils = {
  /**
   * Gera ou recupera do cache o calendário epidemiológico para um ano específico.
   * @param {number} year O ano desejado.
   * @returns {Array<{week: number, start: string, end: string}>}
   */
  getCalendar(year) {
    if (calendarCache.has(year)) {
      return calendarCache.get(year);
    }
    if (precomputedCalendars[year]) {
      calendarCache.set(year, precomputedCalendars[year]);
      return precomputedCalendars[year];
    }

    const calendar = [];
    const jan1 = new Date(year, 0, 1);
    const dayOfWeek = jan1.getDay(); // 0 = Domingo, 1 = Segunda...

    // Encontra o domingo da primeira semana do ano
    let startDateOfFirstWeek = new Date(jan1);
    startDateOfFirstWeek.setDate(jan1.getDate() - dayOfWeek);

    // Se o domingo da primeira semana de Janeiro tiver menos de 4 dias em Janeiro, a primeira SE é a próxima.
    if (dayOfWeek < 4) {
      // Domingo é 0, Quarta é 3. Se Jan 1 é Qui(4), Sex(5) ou Sab(6), a semana anterior tem mais dias.
      startDateOfFirstWeek.setDate(startDateOfFirstWeek.getDate() + 7);
    }

    let currentStart = startDateOfFirstWeek;
    for (let i = 1; i <= 53; i++) {
      const end = new Date(currentStart);
      end.setDate(currentStart.getDate() + 6);

      // Para de adicionar se a próxima semana começar no ano seguinte e não for a semana 53
      if (end.getFullYear() > year && i > 52) {
        break;
      }

      calendar.push({
        week: i,
        start: currentStart.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      });

      currentStart = new Date(end);
      currentStart.setDate(end.getDate() + 1);
    }

    calendarCache.set(year, calendar);
    return calendar;
  },

  /**
   * Encontra a semana epidemiológica para uma data específica.
   * @param {Date} [date=new Date()] A data para verificar.
   * @returns {{week: number, start: string, end: string, year: number}}
   */
  getCurrentEpidemiologicalWeek(date = new Date()) {
    const year = date.getFullYear();
    const today = new Date(date.valueOf());
    today.setHours(0, 0, 0, 0);

    // Verifica o calendário do ano atual e do ano anterior (para o caso de a data estar no final de dezembro)
    const yearsToCkeck = [year, year - 1];
    for (const y of yearsToCkeck) {
      const calendar = this.getCalendar(y);
      for (const week of calendar) {
        const start = new Date(week.start);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(week.end);
        end.setUTCHours(23, 59, 59, 999);
        if (today >= start && today <= end) {
          return { ...week, year: y };
        }
      }
    }

    // Fallback de segurança
    return { ...this.getCalendar(year)[0], year };
  },

  formatDateRange(weekInfo) {
    if (!weekInfo) return "";
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    };
    const start = new Date(weekInfo.start).toLocaleDateString("pt-BR", options);
    const end = new Date(weekInfo.end).toLocaleDateString("pt-BR", options);
    return `${start} a ${end}`;
  },
};
