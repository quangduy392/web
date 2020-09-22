<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <!-- <b-nav-item
                        to="/process-monitor/report/summary"
                        class="text-nowrap"
                    >{{ $t('alert.report.summary') }}</b-nav-item>-->
                    <b-nav-item to="/process-monitor/report/detail" class="text-nowrap">
                        {{ $t('alert.report.detail') }}
                    </b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
            <template slot="sub-header-right">
                <b-button variant="outline-primary" class="bg-none" @click="exportExcel">
                    <i class="fa fa-file-excel-o mr-1" aria-hidden="true"></i>
                    Xuất báo cáo excel
                </b-button>
            </template>
        </sub-header>

        <div class="page-content sub-header-page-content pb-0 p-4">
            <div class="mb-3">
                <div class="d-inline-block">
                    <div>{{ $t('processMonitor.detailReport.dateSelect') }}:</div>
                    <date-picker
                        v-model="dateTimefilter.date"
                        format="DD/MM/YYYY"
                        :clearable="false"
                        :editable="false"
                        class="mr-3"
                        @input="dateTimefilterChange"
                    ></date-picker>
                </div>

                <div class="d-inline-block">
                    <div>{{ $t('processMonitor.detailReport.morningStartTime') }}:</div>
                    <date-picker
                        v-model="dateTimefilter.morningStartTime"
                        :time-picker-options="{
                            start: '06:00',
                            step: '00:30',
                            end: '12:00'
                        }"
                        format="HH:mm"
                        type="time"
                        :clearable="false"
                        :editable="false"
                        :disabled-time="date => date >= dateTimefilter.morningEndTime"
                        class="mr-3"
                        @input="dateTimefilterChange"
                    ></date-picker>
                </div>

                <div class="d-inline-block">
                    <div>{{ $t('processMonitor.detailReport.morningEndTime') }}:</div>
                    <date-picker
                        v-model="dateTimefilter.morningEndTime"
                        :time-picker-options="{
                            start: '06:00',
                            step: '00:30',
                            end: '12:00'
                        }"
                        format="HH:mm"
                        type="time"
                        :clearable="false"
                        :editable="false"
                        :disabled-time="date => date <= dateTimefilter.morningStartTime"
                        class="mr-3"
                        @input="dateTimefilterChange"
                    ></date-picker>
                </div>

                <div class="d-inline-block">
                    <div>{{ $t('processMonitor.detailReport.afternoonStartTime') }}:</div>
                    <date-picker
                        v-model="dateTimefilter.afternoonStartTime"
                        :time-picker-options="{
                            start: '12:30',
                            step: '00:30',
                            end: '18:00'
                        }"
                        format="HH:mm"
                        type="time"
                        :clearable="false"
                        :editable="false"
                        :disabled-time="date => date >= dateTimefilter.afternoonEndTime"
                        class="mr-3"
                        @input="dateTimefilterChange"
                    ></date-picker>
                </div>

                <div class="d-inline-block">
                    <div>{{ $t('processMonitor.detailReport.afternoonEndTime') }}:</div>
                    <date-picker
                        v-model="dateTimefilter.afternoonEndTime"
                        :time-picker-options="{
                            start: '12:30',
                            step: '00:30',
                            end: '18:00'
                        }"
                        format="HH:mm"
                        type="time"
                        :clearable="false"
                        :editable="false"
                        :disabled-time="date => date <= dateTimefilter.afternoonStartTime"
                        class="mr-3"
                        @input="dateTimefilterChange"
                    ></date-picker>
                </div>
            </div>
            <b-table
                bordered
                striped
                dark
                responsive
                :fields="fields"
                :items="tableData"
                :current-page="currentPage"
                :per-page="CONSTANTS.RECEPTION_REPORT_DETAIL_PER_PAGE"
            >
                <template slot="thead-top" slot-scope="data">
                    <tr>
                        <th rowspan="2" class="text-center align-middle">#</th>
                        <th colspan="2" class="text-center">{{ $t('processMonitor.region') }}</th>
                        <th colspan="3" class="text-center">{{ $t('processMonitor.morning') }}</th>
                        <th colspan="3" class="text-center">
                            {{ $t('processMonitor.afternoon') }}
                        </th>
                        <th rowspan="2" class="text-center align-middle">
                            {{ $t('processMonitor.sum') + '(' + $t('processMonitor.hour') + ')' }}
                        </th>
                        <th rowspan="2" class="text-center align-middle">
                            {{ $t('processMonitor.percent') }}
                        </th>
                    </tr>
                </template>
            </b-table>
            <div
                v-if="receptionTimeReport.length > CONSTANTS.RECEPTION_REPORT_DETAIL_PER_PAGE"
                class="my-1"
            >
                <b-pagination
                    v-model="currentPage"
                    :total-rows="receptionTimeReport.length"
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
        DatePicker
    },
    mounted: function() {
        this.$nextTick(function() {
            this.dateTimefilterChange();
        });
    },
    computed: {
        ...mapState({
            receptionTimeReport: state => state.reception.receptionTimeReport
        }),
        tableData() {
            return this.receptionTimeReport.map((row, index) => {
                // const morningAbsentTime =
                //     this.totalTime.morning - row.morningPresentTime > 0
                //         ? ((this.totalTime.morning - row.morningPresentTime) / 60).toFixed(2)
                //         : 0;
                // const afternoonAbsentTime =
                //     this.totalTime.afternoon - row.afternoonPresentTime > 0
                //         ? ((this.totalTime.afternoon - row.afternoonPresentTime) / 60).toFixed(2)
                //         : 0;
                return {
                    index: index + 1,
                    district: row.district,
                    ward: row.ward,
                    morningStartTime:
                        row.morningStartFrame &&
                        this.getFrameTimeRange(row.morningStartFrame).startTime,
                    morningEndTime:
                        row.morningEndFrame && this.getFrameTimeRange(row.morningEndFrame).endTime,
                    morningPresentTime: (row.morningPresentTime / 60).toFixed(2),
                    // morningAbsentTime,
                    afternoonStartTime:
                        row.afternoonStartFrame &&
                        this.getFrameTimeRange(row.afternoonStartFrame).startTime,
                    afternoonEndTime:
                        row.afternoonEndFrame &&
                        this.getFrameTimeRange(row.afternoonEndFrame).endTime,
                    afternoonPresentTime: (row.afternoonPresentTime / 60).toFixed(2),
                    // afternoonAbsentTime,
                    sum: ((row.morningPresentTime + row.afternoonPresentTime) / 60).toFixed(2),
                    percent:
                        (
                            ((row.morningPresentTime + row.afternoonPresentTime) * 100) /
                            this.totalTime.total
                        ).toFixed(2) + '%'
                };
            });
        }
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
                    key: 'district',
                    label: this.$t('processMonitor.district')
                },
                {
                    key: 'ward',
                    label: this.$t('processMonitor.ward')
                },
                {
                    class: 'text-center',
                    key: 'morningStartTime',
                    label: 'Thời gian đến'
                },
                {
                    class: 'text-center',
                    key: 'morningEndTime',
                    label: 'Thời gian về'
                },
                {
                    class: 'text-center',
                    key: 'morningPresentTime',
                    label:
                        this.$t('processMonitor.present') +
                        ' (' +
                        this.$t('processMonitor.hour') +
                        ')'
                },
                // {
                //     class: 'text-center',
                //     key: 'morningAbsentTime',
                //     label:
                //         this.$t('processMonitor.absent') +
                //         ' (' +
                //         this.$t('processMonitor.hour') +
                //         ')'
                // },
                {
                    class: 'text-center',
                    key: 'afternoonStartTime',
                    label: 'Thời gian đến'
                },
                {
                    class: 'text-center',
                    key: 'afternoonEndTime',
                    label: 'Thời gian về'
                },
                {
                    class: 'text-center',
                    key: 'afternoonPresentTime',
                    label:
                        this.$t('processMonitor.present') +
                        ' (' +
                        this.$t('processMonitor.hour') +
                        ')'
                },
                // {
                //     class: 'text-center',
                //     key: 'afternoonAbsentTime',
                //     label:
                //         this.$t('processMonitor.absent') +
                //         ' (' +
                //         this.$t('processMonitor.hour') +
                //         ')'
                // },
                {
                    thClass: 'd-none',
                    tdClass: 'text-center',
                    key: 'sum',
                    label: this.$t('processMonitor.sum')
                },
                {
                    thClass: 'd-none',
                    tdClass: 'text-center',
                    key: 'percent',
                    label: this.$t('processMonitor.percent')
                }
            ],
            dateTimefilter: {
                date: moment().toDate(),
                morningStartTime: moment()
                    .set({ hour: 8, minute: 0, second: 0, millisecond: 0 })
                    .toDate(),
                morningEndTime: moment()
                    .set({ hour: 11, minute: 0, second: 0, millisecond: 0 })
                    .toDate(),
                afternoonStartTime: moment()
                    .set({ hour: 14, minute: 0, second: 0, millisecond: 0 })
                    .toDate(),
                afternoonEndTime: moment()
                    .set({ hour: 16, minute: 0, second: 0, millisecond: 0 })
                    .toDate()
            },
            totalTime: {}
        };
    },
    methods: {
        ...mapActions({
            resetReceptionData: 'reception/resetData',
            getReceptionTimeReport: 'reception/getReceptionTimeReport'
        }),
        dateTimefilterChange() {
            const morningStartTime = moment(this.dateTimefilter.morningStartTime);
            const morningEndTime = moment(this.dateTimefilter.morningEndTime);
            const morningTotalTime = morningEndTime.diff(morningStartTime) / 60000; // Minutes
            const morningParams = {
                from: moment(this.dateTimefilter.date)
                    .set({
                        hour: morningStartTime.format('H'),
                        minute: morningStartTime.format('mm'),
                        millisecond: 0
                    })
                    .format(),
                to: moment(this.dateTimefilter.date)
                    .set({
                        hour: morningEndTime.format('HH'),
                        minute: morningEndTime.format('mm'),
                        millisecond: 0
                    })
                    .format()
            };

            const afternoonStartTime = moment(this.dateTimefilter.afternoonStartTime);
            const afternoonEndTime = moment(this.dateTimefilter.afternoonEndTime);
            const afterTotalTime = afternoonEndTime.diff(afternoonStartTime) / 60000; // Minutes
            const afternoonParams = {
                from: moment(this.dateTimefilter.date)
                    .set({
                        hour: afternoonStartTime.format('H'),
                        minute: afternoonStartTime.format('mm'),
                        millisecond: 0
                    })
                    .format(),
                to: moment(this.dateTimefilter.date)
                    .set({
                        hour: afternoonEndTime.format('HH'),
                        minute: afternoonEndTime.format('mm'),
                        millisecond: 0
                    })
                    .format()
            };

            this.totalTime = {
                morning: morningTotalTime,
                afternoon: afterTotalTime,
                total: morningTotalTime + afterTotalTime
            };

            this.resetReceptionData();
            this.getReceptionTimeReport({
                morningParams,
                afternoonParams
            });
        },
        getFrameTimeRange(frameIndex) {
            const framePeriod = 10; // 10 minutes
            const startMinute = frameIndex * framePeriod;
            const endMinute = (frameIndex + 1) * framePeriod;
            return {
                startTime: this.convertMinuteToTime(startMinute),
                endTime: this.convertMinuteToTime(endMinute)
            };
        },
        convertMinuteToTime(minutes) {
            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;

            return `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`;
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
                this.tableData.map((item, index) => {
                    return {
                        STT: item.index,
                        'Quận/Huyện': item.district,
                        'Xã/Phường': item.ward,
                        'Thời gian đến buổi sáng': item.morningStartTime,
                        'Thời gian về buổi sáng': item.morningEndTime,
                        'Thời gian có mặt buổi sáng (giờ)': item.morningPresentTime,
                        'Thời gian đến buổi chiều': item.afternoonStartTime,
                        'Thời gian về buổi chiều': item.afternoonEndTime,
                        'Thời gian có mặt buổi chiều (giờ)': item.afternoonPresentTime,
                        'Tổng (giờ)': item.sum,
                        'Phần trăm': item.percent
                    };
                }),
                'Báo cáo tiếp dân ' + moment().format('DD-MM-YYYY')
            );
        }
    }
};
</script>
