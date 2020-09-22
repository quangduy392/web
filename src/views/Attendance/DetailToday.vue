<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <AttendanceSubNavbarNav></AttendanceSubNavbarNav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content pb-0 p-4">
            <hr />
            <center>
                <h1 style="color: purple-blue">Danh sách chi tiết điểm danh trong ngày</h1>
            </center>

            <hr />
            <b-table
                bordered
                striped
                dark
                responsive
                :fields="fields"
                :items="worktimeReport"
                :current-page="currentPage"
                :per-page="CONSTANTS.RECEPTION_REPORT_DETAIL_PER_PAGE"
            >
                <template slot="thead-top" slot-scope="data">
                    <tr>
                        <th rowspan="2" class="text-center align-middle">#</th>
                        <th colspan="2" class="text-center">Account</th>
                        <th colspan="3" class="text-center">{{ $t('processMonitor.morning') }}</th>
                        <th colspan="3" class="text-center">
                            {{ $t('processMonitor.afternoon') }}
                        </th>
                        <th rowspan="2" class="text-center align-middle">
                            Tổng thời gian làm việc ngày
                        </th>
                        <th rowspan="2" class="text-center align-middle">Ghi chú</th>
                    </tr>
                </template>
                <template slot="index" slot-scope="data">
                    {{
                        (currentPage - 1) * CONSTANTS.RECEPTION_REPORT_DETAIL_PER_PAGE +
                            (data.index + 1)
                    }}
                </template>

                <template slot="startMorningTimeSec" slot-scope="data">
                    {{ getTimeFromSecond(data.item.startMorningTimeSec) }}
                </template>

                <template slot="endMorningTimeSec" slot-scope="data">
                    {{ getTimeFromSecond(data.item.endMorningTimeSec) }}
                </template>

                <template slot="sumMorning" slot-scope="data">
                    {{ getTimeLong(data.item.endMorningTimeSec - data.item.startMorningTimeSec) }}
                </template>

                <template slot="startAfternoonTimeSec" slot-scope="data">
                    {{ getTimeFromSecond(data.item.startAfternoonTimeSec) }}
                </template>

                <template slot="endAfternoonTimeSec" slot-scope="data">
                    {{ getTimeFromSecond(data.item.endAfternoonTimeSec) }}
                </template>

                <template slot="sumAfternoon" slot-scope="data">
                    {{
                        getTimeLong(data.item.endAfternoonTimeSec - data.item.startAfternoonTimeSec)
                    }}
                </template>

                <template slot="sum" slot-scope="data">
                    {{
                        getTimeLong(
                            standardTimeLong(
                                data.item.endMorningTimeSec - data.item.startMorningTimeSec
                            ) +
                                standardTimeLong(
                                    data.item.endAfternoonTimeSec - data.item.startAfternoonTimeSec
                                )
                        )
                    }}
                </template>
                <template slot="note" slot-scope="data" style="max-width: 100px;">
                    <span class="text-danger">
                        {{
                            getNote(
                                data.item.startMorningTimeSec,
                                data.item.endMorningTimeSec,
                                data.item.startAfternoonTimeSec,
                                data.item.endAfternoonTimeSec
                            ).join(', ')
                        }}
                    </span>
                </template>
            </b-table>
            <div
                v-if="worktimeReport.length > CONSTANTS.RECEPTION_REPORT_DETAIL_PER_PAGE"
                class="my-1"
            >
                <b-pagination
                    v-model="currentPage"
                    :total-rows="worktimeReport.length"
                    :per-page="CONSTANTS.RECEPTION_REPORT_DETAIL_PER_PAGE"
                    :hide-goto-end-buttons="true"
                    :prev-text="$t('common.prevPage')"
                    :next-text="$t('common.nextPage')"
                    class="my-0"
                    align="center"
                ></b-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '@/constants';
import AttendanceSubNavbarNav from './SubNavbarNav';
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';
import moment from 'moment-timezone';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

export default {
    components: {
        DatePicker,
        AttendanceSubNavbarNav
    },
    mounted: function() {
        this.$nextTick(function() {
            this.dateTimefilterChange();
            this.getGroupPresentReport();
        });
    },
    computed: {
        ...mapState({
            groupPresentReport: state => state.attendance.groupPresentReport,
            worktimeReport: state => state.attendance.worktimeReport
        })
    },
    data() {
        return {
            CONSTANTS,
            currentPage: 1,
            fields: [
                {
                    thClass: 'd-none',
                    tdClass: 'text-center',
                    key: 'index',
                    label: '#'
                },
                {
                    key: 'name',
                    label: 'Tên'
                },
                {
                    key: 'group',
                    label: 'Phòng ban'
                },
                {
                    class: 'text-center',
                    key: 'startMorningTimeSec',
                    label: 'Thời gian đến'
                },
                {
                    class: 'text-center',
                    key: 'endMorningTimeSec',
                    label: 'Thời gian về'
                },
                {
                    class: 'text-center',
                    key: 'sumMorning',
                    label: 'Thời gian làm việc'
                },
                {
                    class: 'text-center',
                    key: 'startAfternoonTimeSec',
                    label: 'Thời gian đến'
                },
                {
                    class: 'text-center',
                    key: 'endAfternoonTimeSec',
                    label: 'Thời gian về'
                },
                {
                    class: 'text-center',
                    key: 'sumAfternoon',
                    label: 'Thời gian làm việc'
                },
                {
                    thClass: 'd-none',
                    tdClass: 'text-center',
                    key: 'sum',
                    label: 'Tổng thời gian làm việc ngày'
                },
                {
                    thClass: 'd-none',
                    tdClass: 'note',
                    key: 'note',
                    label: 'Ghi chú'
                }
            ],
            dateTimefilter: {
                date: moment().toDate(),
                morningStartTime: moment()
                    .set({
                        hour: CONSTANTS.MORNING_WORK_TIME_START_HOUR,
                        minute: CONSTANTS.MORNING_WORK_TIME_START_MINUTES,
                        second: 0,
                        millisecond: 0
                    })
                    .toDate(),
                morningEndTime: moment()
                    .set({
                        hour: CONSTANTS.MORNING_WORK_TIME_END_HOUR,
                        minute: CONSTANTS.MORNING_WORK_TIME_END_MINUTES,
                        second: 0,
                        millisecond: 0
                    })
                    .toDate(),
                afternoonStartTime: moment()
                    .set({
                        hour: CONSTANTS.AFTERNOON_WORK_TIME_START_HOUR,
                        minute: CONSTANTS.AFTERNOON_WORK_TIME_START_MINUTES,
                        second: 0,
                        millisecond: 0
                    })
                    .toDate(),
                afternoonEndTime: moment()
                    .set({
                        hour: CONSTANTS.AFTERNOON_WORK_TIME_END_HOUR,
                        minute: CONSTANTS.AFTERNOON_WORK_TIME_END_MINUTES,
                        second: 0,
                        millisecond: 0
                    })
                    .toDate(),
                group: ''
            }
        };
    },
    methods: {
        ...mapActions({
            getGroupPresentReport: 'attendance/getGroupPresentReport',
            getAttendanceWorktimeReport: 'attendance/getAttendanceWorktimeReport'
        }),
        dateTimefilterChange() {
            const morningParams = {
                from: moment(this.dateTimefilter.date)
                    .set({
                        hour: 6,
                        minute: 0,
                        millisecond: 0
                    })
                    .format(),
                to: moment(this.dateTimefilter.date)
                    .set({
                        hour: 12,
                        minute: 0,
                        millisecond: 0
                    })
                    .format(),
                group: this.dateTimefilter.group ? this.dateTimefilter.group : undefined
            };

            const afternoonParams = {
                from: moment(this.dateTimefilter.date)
                    .set({
                        hour: 12,
                        minute: 0,
                        millisecond: 0
                    })
                    .format(),
                to: moment(this.dateTimefilter.date)
                    .set({
                        hour: 22,
                        minute: 0,
                        millisecond: 0
                    })
                    .format(),
                group: this.dateTimefilter.group ? this.dateTimefilter.group : undefined
            };

            this.getAttendanceWorktimeReport({
                morningParams,
                afternoonParams
            });
            this.currentPage = 1;
        },
        getTimeFromSecond(second) {
            if (!second) return '';
            return moment.utc(second * 1000).format('HH:mm:ss');
        },
        getTimeLong(second) {
            if (!second) return '0h0p';
            const hours = Math.floor(second / 3600);
            const minutes = Math.floor((second - hours * 3600) / 60);
            return `${hours}h${minutes}p`;
        },
        standardTimeLong(second) {
            if (!second) return 0;
            return second;
        },
        exportAsExcelFile(json, excelFileName) {
            const worksheet = XLSX.utils.json_to_sheet(json);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile(excelBuffer, excelFileName);
        },
        saveAsExcelFile(buffer, fileName) {
            const data = new Blob([buffer], { type: EXCEL_TYPE });
            FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
        },
        exportExcel() {
            this.exportAsExcelFile(
                this.worktimeReport.map((item, index) => {
                    return {
                        STT: index + 1,
                        Tên: item.name,
                        'Phòng ban': item.group,
                        'Thời gian đến sáng': this.getTimeFromSecond(item.startMorningTimeSec),
                        'Thời gian về sáng': this.getTimeFromSecond(item.endMorningTimeSec),
                        'Thời gian làm việc sáng': this.getTimeLong(
                            item.endMorningTimeSec - item.startMorningTimeSec
                        ),
                        'Thời gian đến chiều': this.getTimeFromSecond(item.startAfternoonTimeSec),
                        'Thời gian về chiều': this.getTimeFromSecond(item.endAfternoonTimeSec),
                        'Thời gian làm việc chiều': this.getTimeLong(
                            item.endAfternoonTimeSec - item.startAfternoonTimeSec
                        ),
                        'Thời gian làm việc': this.getTimeLong(
                            this.standardTimeLong(
                                item.endMorningTimeSec - item.startMorningTimeSec
                            ) +
                                this.standardTimeLong(
                                    item.endAfternoonTimeSec - item.startAfternoonTimeSec
                                )
                        ),
                        'Ghi chú': this.getNote(
                            item.startMorningTimeSec,
                            item.endMorningTimeSec,
                            item.startAfternoonTimeSec,
                            item.endAfternoonTimeSec
                        ).join(', ')
                    };
                }),
                'Báo cáo điểm danh ' + moment().format('DD-MM-YYYY')
            );
        },
        getDiffTime(date1, date2) {
            return date1.getTime() - date2.getTime();
        },
        getDiffSecondTime(second, date) {
            const time = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
            return second - time;
        },
        getNote(startMorning, endMorning, startAfternoon, endAfternoon) {
            const notes = [];
            if (this.getDiffTime(new Date(), this.dateTimefilter.morningStartTime) < 0) {
                return notes;
            }
            if (this.getDiffTime(new Date(), this.dateTimefilter.date) > 86400000) {
                if (!startMorning && !startAfternoon) {
                    notes.push('Nghỉ cả ngày');
                } else if (!startMorning) notes.push('Nghỉ sáng');
                else if (!startAfternoon) notes.push('Nghỉ chiều');
                if (
                    this.getDiffSecondTime(startMorning, this.dateTimefilter.morningStartTime) > 0
                ) {
                    notes.push('Đi muộn buổi sáng');
                }
                if (this.getDiffSecondTime(endMorning, this.dateTimefilter.morningEndTime) < 0) {
                    notes.push('Về sớm buổi sáng');
                }
                if (
                    this.getDiffSecondTime(startAfternoon, this.dateTimefilter.afternoonStartTime)
                ) {
                    notes.push('Đi muộn buổi chiều');
                }
                if (
                    this.getDiffSecondTime(endAfternoon, this.dateTimefilter.afternoonEndTime) < 0
                ) {
                    notes.push('Về sớm buổi chiều');
                }
            } else {
                if (
                    !startMorning &&
                    !startAfternoon &&
                    this.getDiffTime(new Date(), this.dateTimefilter.afternoonEndTime) > 0
                ) {
                    notes.push('Nghỉ cả ngày');
                } else {
                    if (
                        !startMorning &&
                        this.getDiffTime(new Date(), this.dateTimefilter.morningEndTime) > 0
                    ) {
                        notes.push('Nghỉ sáng');
                    }
                    if (
                        !startAfternoon &&
                        this.getDiffTime(new Date(), this.dateTimefilter.afternoonEndTime) > 0
                    ) {
                        notes.push('Nghỉ chiều');
                    }
                }
                if (
                    this.getDiffSecondTime(startMorning, this.dateTimefilter.morningStartTime) >
                        0 &&
                    this.getDiffTime(new Date(), this.dateTimefilter.morningStartTime) > 0
                ) {
                    notes.push('Đi muộn buổi sáng');
                }
                if (
                    this.getDiffSecondTime(endMorning, this.dateTimefilter.morningEndTime) < 0 &&
                    this.getDiffTime(new Date(), this.dateTimefilter.morningEndTime) > 0
                ) {
                    notes.push('Về sớm buổi sáng');
                }
                if (
                    this.getDiffSecondTime(startAfternoon, this.dateTimefilter.afternoonStartTime) >
                        0 &&
                    this.getDiffTime(new Date(), this.dateTimefilter.afternoonStartTime) > 0
                ) {
                    notes.push('Đi muộn buổi chiều');
                }
                if (
                    this.getDiffSecondTime(endAfternoon, this.dateTimefilter.afternoonEndTime) <
                        0 &&
                    this.getDiffTime(new Date(), this.dateTimefilter.afternoonEndTime) > 0
                ) {
                    notes.push('Về sớm buổi chiều');
                }
            }
            return notes;
        }
    }
};
</script>
<style lang="css">
.note {
    max-width: 150px;
}
</style>
