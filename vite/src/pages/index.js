import { renderAboutPage } from './about.js';
import { renderAbsencePage } from './absence.js';
import { renderAdvicePage } from './advice.js';
import { renderAnnouncePage } from './announce.js';
import { renderBlankFormsPage } from './blank-forms.js';
import { renderCertificatesPage } from './certificates.js';
import { renderChangeEmailPage } from './change-email.js';
import { renderChangePasswordPage } from './change-password.js';
import { renderContractsPage } from './contracts.js';
import { renderEducationStandardPage } from './education-standard.js';
import { renderElectronicResourcesPage } from './electronic-resources.js';
import { renderEstimateFormsPage } from './estimate-forms.js';
import { renderFeedbackListPage } from './feedback-list.js';
import { renderLibraryPage } from './library.js';
import { renderOrdersPage } from './orders.js';
import { renderPortfolioPage } from './portfolio.js';
import { renderScheduleDetailPage } from './schedule-detail.js';
import { renderShowSlotsPage } from './show-slots.js';
import { renderSignsPage } from './signs/index.js';
import { renderSpecialSurveysPage } from './special-surveys.js';
import { renderTeachPlanPage } from './teach-plan.js';
import { renderTeacherNotesPage } from './teacher-notes.js';
import { renderTeacherStatsPage } from './teacher-stats.js';
import { renderTeachersPage } from './teachers.js';
import { renderTermTestPage } from './term-test.js';
import { renderThemePage } from './theme.js';
import { renderTimetablePage } from './timetable/index.js';
import { renderVisitsJournalPage } from './visits-journal.js';
import { renderVisitsPairPage } from './visits-pair.js';

// Карта соответствия идентификаторов страниц ЕТИСа их обработчикам
const handlers = new Map([
    ['stu.teach_plan', renderTeachPlanPage],
    ['stu.fcl_choice', renderTeachPlanPage],
    ['stu.ebl_choice', renderTeachPlanPage],
    ['ebl_stu.ebl_choice', renderTeachPlanPage],
    ['stu.schedule_detail', renderScheduleDetailPage],
    ['stu_phs.show_slots', renderShowSlotsPage],
    ['stu.tpr', renderThemePage],
    ['stu.theme', renderThemePage],
    ['stu.teachers', renderTeachersPage],
    ['stu.sc_portfolio', renderPortfolioPage],
    ['stu.timetable', renderTimetablePage],
    ['stu.change_pass_form', renderChangePasswordPage],
    ['stu.change_pass', renderChangePasswordPage],
    ['stu_email_pkg.change_email', renderChangeEmailPage],
    ['stu_ann.announces', renderAnnouncePage],
    ['stu.announce', renderAnnouncePage],
    ['stu.teacher_notes', renderTeacherNotesPage],
    ['cert_pkg.stu_certif', renderCertificatesPage],
    ['stu.signs', renderSignsPage],
    ['stu.electr', renderElectronicResourcesPage],
    ['cust.estimate_tt_form', renderEstimateFormsPage],
    ['cust.estimate_tpr_form', renderEstimateFormsPage],
    ['cust.est_plan_form_stu', renderEstimateFormsPage],
    ['stu_plus.advice', renderAdvicePage],
    ['stu.ses', renderEducationStandardPage],
    ['stu.library', renderLibraryPage],
    ['stu.special_est_list', renderSpecialSurveysPage],
    ['stu.term_test', renderTermTestPage],
    ['stu.about', renderAboutPage],
    ['stu_pay.contract_list', renderContractsPage],
    ['stu.orders', renderOrdersPage],
    ['stu_plus.blank_forms', renderBlankFormsPage],
    ['stu.dis_stat', renderTeacherStatsPage],
    ['stu.teacher_stats', renderTeacherStatsPage],
    ['stu_jour.group_tt', renderVisitsJournalPage],
    ['stu_jour.tt_pair', renderVisitsPairPage],
    ['est_pkg.show_list', renderFeedbackListPage],
    ['stu.absence', renderAbsencePage],
]);

// Запускает обработчик оформления для текущей страницы
export function runPageHandler(page) {
    const handler = handlers.get(page);
    if (handler) handler();
}
