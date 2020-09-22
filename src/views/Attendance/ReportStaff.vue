<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/attendance/report/summary" class="text-nowrap">{{
                        $t('attendanceCommon.report.summary')
                    }}</b-nav-item>
                    <b-nav-item to="/attendance/report/detail" class="text-nowrap">{{
                        $t('attendanceCommon.report.detail')
                    }}</b-nav-item>
                    <b-nav-item to="/attendance/report/staff-report" class="text-nowrap">{{
                        $t('attendanceCommon.report.employees')
                    }}</b-nav-item>
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

        <div class="page-content sub-header-page-content py-0 px-1">
            <div class="d-flex h-100">
                <div class="pl-3 h-100 overflow-y-auto flex-1 d-flex flex-column" ref="reportBody">
                    <b-row class="mr-0">
                        <b-table
                            striped
                            hover
                            show-empty
                            dark
                            selectable
                            select-mode="single"
                            selected-variant="active"
                            :fields="fields"
                            :items="allProfiles"
                            @row-selected="gotoStaffReportDetail"
                            class="mb-1"
                            :current-page="currentPage"
                            :per-page="perPage"
                        >
                            <template slot="STT" slot-scope="data">{{
                                data.index + 1 + (currentPage - 1) * perPage
                            }}</template>
                        </b-table>
                    </b-row>
                    <b-pagination
                        v-model="currentPage"
                        :total-rows="allProfiles.length"
                        :per-page="perPage"
                        hide-goto-end-buttons
                        :prev-text="$t('common.prevPage')"
                        :next-text="$t('common.nextPage')"
                        align="center"
                        style="margin: auto;"
                    ></b-pagination>
                </div>
            </div>
        </div>
        <!-- staff report detail -->
        <b-modal
            ref="staffReportDetail"
            :title="'Báo cáo chi tiết: ' + profileSelected.name"
            no-close-on-esc
            no-close-on-backdrop
            dialog-class="h-90"
            content-class="h-100"
            body-class="overflow-auto p-0"
            size="xl"
        >
            <div class="h-100">
                <b-table
                    striped
                    hover
                    show-empty
                    dark
                    :fields="dialogFields"
                    :items="dialogItems"
                    class="mb-0"
                >
                    <template slot="STT" slot-scope="data">{{ data.index + 1 }}</template>
                </b-table>
            </div>
            <template slot="modal-footer">
                <div class="d-flex align-items-center justify-content-end h-100">
                    <b-button variant="primary" @click="exportStaffDetailExcel">
                        <i class="fa fa-file-excel-o mr-1" aria-hidden="true"></i>Xuất báo cáo excel
                    </b-button>
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script>
import AttendanceSubNavbarNav from './SubNavbarNav';
import { mapActions, mapState } from 'vuex';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

export default {
    components: {
        AttendanceSubNavbarNav
    },
    data() {
        return {
            perPage: 15,
            currentPage: 1,
            fields: [
                {
                    key: 'STT',
                    thStyle: { width: '70px' },
                    thClass: 'text-center',
                    tdClass: 'text-center'
                },
                { key: 'name', label: 'Tên nhân viên' },
                { key: 'group', label: 'Phòng' },
                {
                    key: 'late',
                    label: 'Số lần đi muộn',
                    thStyle: { width: '130px' },
                    thClass: 'text-center',
                    tdClass: 'text-center'
                },
                {
                    key: 'soon',
                    label: 'Số lần về sớm',
                    thStyle: { width: '130px' },
                    thClass: 'text-center',
                    tdClass: 'text-center'
                },
                {
                    key: 'absent',
                    label: 'Số lần vắng mặt',
                    thStyle: { width: '130px' },
                    thClass: 'text-center',
                    tdClass: 'text-center'
                }
            ],
            profileSelected: {},
            dialogFields: [
                {
                    key: 'STT',
                    thStyle: { width: '70px' },
                    thClass: 'text-center',
                    tdClass: 'text-center'
                },
                { key: 'type', label: 'Loại thông tin' },
                { key: 'date', label: 'Ngày' },
                { key: 'time', label: 'Giờ' }
            ],
            dialogItems: [
                { type: 'Đi muộn', date: '10/10/2019', time: '8:35' },
                { type: 'Đi muộn', date: '11/10/2019', time: '8:45' },
                { type: 'Đi muộn', date: '12/10/2019', time: '8:45' },
                { type: 'Về sớm', date: '15/10/2019', time: '16:41' },
                { type: 'Về sớm', date: '16/10/2019', time: '16:41' },
                { type: 'Đi muộn', date: '18/10/2019', time: '8:45' },
                { type: 'Về sớm', date: '19/10/2019', time: '16:41' },
                { type: 'Đi muộn', date: '21/10/2019', time: '8:45' },
                { type: 'Vắng mặt', date: '25/10/2019', time: '' },
                { type: 'Đi muộn', date: '01/11/2019', time: '8:45' },
                { type: 'Về sớm', date: '02/11/2019', time: '16:41' },
                { type: 'Về sớm', date: '03/11/2019', time: '16:41' },
                { type: 'Đi muộn', date: '04/11/2019', time: '9:00' },
                { type: 'Đi muộn', date: '05/11/2019', time: '8:43' }
            ]
        };
    },
    methods: {
        ...mapActions({
            getListProfile: 'profile/getList'
        }),
        exportExcel() {
            this.exportAsExcelFile(
                this.allProfiles.map((profile, index) => {
                    return {
                        STT: index + 1,
                        'Tên nhân viên': profile.name,
                        Phòng: profile.group,
                        'Số lần đi muộn': profile.late,
                        'Số lần về sớm': profile.soon,
                        'Số lần vắng mặt': profile.absent
                    };
                }),
                'Báo cáo nhân viên'
            );
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
        gotoStaffReportDetail(items) {
            this.profileSelected = items[0];
            this.$refs.staffReportDetail.show();
        },
        exportStaffDetailExcel() {
            this.exportAsExcelFile(
                this.dialogItems.map((item, index) => {
                    return {
                        STT: index + 1,
                        'Loại thông tin': item.type,
                        Ngày: item.date,
                        Giờ: item.time
                    };
                }),
                'Báo cáo nhân viên ' + this.profileSelected.name
            );
        },
        onWindowSizeChange(e) {
            this.updatePerPage();
        },
        updatePerPage() {
            this.perPage = Math.floor((this.$refs.reportBody.clientHeight - 40) / 45) - 1;
        }
    },
    created() {
        window.addEventListener('resize', this.onWindowSizeChange);
    },
    computed: {
        ...mapState({
            allProfiles: state =>
                state.profile.items.map(item => {
                    return {
                        ...item,
                        late: Math.floor(Math.random() * 100),
                        soon: Math.floor(Math.random() * 100),
                        absent: Math.floor(Math.random() * 100)
                    };
                })
        })
    },
    mounted() {
        this.$nextTick(() => {
            this.getListProfile();
        });
        this.updatePerPage();
    },
    destroyed() {
        window.removeEventListener('resize', this.onWindowSizeChange);
    }
};
</script>

<style scoped>
.card {
    background-color: #3d4247;
    margin-bottom: 5px;
    margin-left: 2.5px;
    margin-right: 2.5px;
    border: none;
    padding: 0px;
}
.card-body {
    padding: 5px 10px;
}
.template-card {
    padding-right: 0px;
    padding-left: 0px;
    margin-right: 0px;
}
</style>
