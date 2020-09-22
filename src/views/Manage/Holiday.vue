<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/management/manage/camera" class="text-nowrap"
                        >CAMERA</b-nav-item
                    >
                    <b-nav-item to="/management/manage/holiday" class="text-nowrap">{{
                        $t('holiday.pageTitle')
                    }}</b-nav-item>
                    <b-nav-item to="/management/manage/configuration" class="text-nowrap">{{
                        $t('configuration.pageTitle')
                    }}</b-nav-item>
                    <b-nav-item to="/management/manage/vms">VMS</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>

            <template slot="sub-header-right">
                <div class="d-flex justify-content-end align-items-center">
                    <div class="input-group border-bottom position-relative" style="width: 190px;">
                        <input
                            type="text"
                            class="form-control bg-transparent border-none text-white pr-4"
                            :placeholder="$t('common.search')"
                            aria-label="Search"
                            aria-describedby="button-addon2"
                            v-model="searchKeyword"
                            style="min-width: 190px;"
                        />
                        <i
                            class="fa fa-search position-absolute"
                            aria-hidden="true"
                            style="top: 50%;right: 4px;margin-top: -6px;"
                        ></i>
                    </div>
                    <div class="text-white mx-3 font-20">|</div>
                    <div class="d-flex align-items-center text-nowrap">
                        <b-button variant="outline-primary" @click="openCreateModal">
                            <i class="fa fa-plus-circle mr-2"></i>
                            <span class="text-uppercase">{{ $t('holiday.create') }}</span>
                        </b-button>
                    </div>
                </div>
            </template>
        </sub-header>

        <div class="page-content sub-header-page-content p-4" ref="countBody">
            <b-table
                striped
                hover
                dark
                :items="searchResults"
                :fields="fields"
                show-empty
                :current-page="currentPage"
                :per-page="perPage"
                :sort-compare="mySortCompare"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
            >
                <template slot="index" slot-scope="data">{{
                    (currentPage - 1) * perPage + (data.index + 1)
                }}</template>
                <template slot="date" slot-scope="data">
                    <span>{{ data.value.split('-').join('/') }}</span>
                </template>
                <template slot="createdAt" slot-scope="data">
                    <span>{{ data.value | formatDateTime }}</span>
                </template>
                <template slot="actions" slot-scope="row">
                    <b-button
                        variant="primary"
                        class="mr-1 min-width-none"
                        @click="showUpdateModal(row.item.id)"
                        v-b-tooltip.hover
                        :title="$t('common.edit')"
                    >
                        <i class="fa fa-pencil"></i>
                    </b-button>
                    <b-button
                        variant="danger"
                        @click="confirmDelete(row.item.id)"
                        v-b-tooltip.hover
                        class="min-width-none"
                        :title="$t('common.delete')"
                    >
                        <i class="fa fa-trash"></i>
                    </b-button>
                </template>
                <template slot="empty">
                    <div class="text-center">
                        <span>{{ $t('holiday.empty') }}</span>
                    </div>
                </template>
            </b-table>
            <div v-if="countRow > perPage" class="my-1">
                <b-pagination
                    v-model="currentPage"
                    :total-rows="countRow"
                    :per-page="perPage"
                    :hide-goto-end-buttons="true"
                    :prev-text="$t('common.prevPage')"
                    :next-text="$t('common.nextPage')"
                    class="my-0"
                    align="center"
                ></b-pagination>
            </div>
        </div>

        <!-- Create/Edit Info -->
        <b-modal
            ref="createOrUpdateModal"
            :ok-title="`${itemInfo.id ? $t('common.update') : $t('common.create')}`"
            :title="`${itemInfo.id ? $t('holiday.update') : $t('holiday.create')}`"
            :cancel-title="$t('common.cancel')"
            @ok="handleCreateOk"
            no-close-on-esc
            no-close-on-backdrop
        >
            <b-form-group :label="$t('holiday.name')">
                <b-form-input
                    maxlength="255"
                    v-model="itemInfo.name"
                    v-validate="'required'"
                    :placeholder="$t('holiday.name')"
                    name="name"
                    :data-vv-as="$t('holiday.name')"
                ></b-form-input>
                <div v-show="errors.has('name')" class="validation-message text-danger">
                    {{ errors.first('name') }}
                </div>
            </b-form-group>

            <b-form-group :label="$t('holiday.time')">
                <date-picker
                    v-model="itemInfo.date"
                    v-validate="'required'"
                    name="date"
                    popupClass="timepicker-popup"
                    :data-vv-as="$t('holiday.time')"
                    class="w-100"
                    format="DD/MM/YYYY"
                    inputClass="form-control bg-white"
                    type="date"
                    value-type="format"
                    :editable="true"
                    :clearable="true"
                    :placeholder="$t('cases.dateSelect')"
                >
                    <span slot="icon-calendar"></span>
                </date-picker>
                <div v-show="errors.has('date')" class="validation-message text-danger">
                    {{ errors.first('date') }}
                </div>
            </b-form-group>
        </b-modal>

        <!-- Confirm Delete -->
        <b-modal
            ref="deleteModal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="onDelete"
            >{{ $t('holiday.deleteConfirmMsg') }}</b-modal
        >
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import changeAlias from '@/utils/changeAlias';
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';

export default {
    components: { DatePicker },
    mounted: function() {
        this.$nextTick(function() {
            this.getList();
            this.updatePerPage();
        });
    },
    computed: {
        ...mapState({
            items: state => state.holiday.items,
            item: state => state.holiday.item
        }),
        countRow() {
            return this.searchResults.length;
        },
        searchResults() {
            if (this.searchKeyword) {
                return this.items.filter(item => {
                    const keyword = changeAlias(this.searchKeyword.toLowerCase());
                    const name = changeAlias(item.name.toLowerCase());
                    return name.indexOf(keyword) > -1;
                });
            }
            return this.items;
        }
    },
    data() {
        return {
            sortBy: 'date',
            sortDesc: true,
            fields: [
                { tdClass: 'align-middle', key: 'index', label: '#' },
                { tdClass: 'align-middle', key: 'name', label: this.$i18n.t('common.name') },
                {
                    tdClass: 'align-middle',
                    key: 'date',
                    label: this.$i18n.t('holiday.time'),
                    sortable: true
                },
                {
                    tdClass: 'align-middle',
                    key: 'createdAt',
                    label: this.$i18n.t('common.lastCreated')
                },
                {
                    thClass: 'fixed-actions-col',
                    key: 'actions',
                    label: this.$i18n.t('common.actions')
                }
            ],
            itemInfo: {},
            currentId: null,
            currentPage: 1,
            perPage: 15,
            searchKeyword: null
        };
    },
    methods: {
        ...mapActions({
            getList: 'holiday/getList',
            updateOrCreate: 'holiday/updateOrCreate',
            deleteById: 'holiday/delete',
            getInfo: 'holiday/getInfo'
        }),
        mySortCompare(a, b, key) {
            if (key !== 'date') {
                return null; // or false
            }
            const aDate = this.$moment(a[key], 'DD/MM/YYYY');
            const bDate = this.$moment(b[key], 'DD/MM/YYYY');
            if (aDate.isValid && bDate.isValid) {
                if (aDate < bDate) {
                    return -1;
                } else if (aDate > bDate) {
                    return 1;
                } else {
                    return 0;
                }
            }
            return null;
        },
        handleCreateOk(modal) {
            modal.preventDefault();
            this.onSubmit();
        },
        onSubmit() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    if (this.itemInfo.id) {
                        this.update();
                    } else {
                        this.add();
                    }
                    this.$refs.createOrUpdateModal.hide();
                    this.$toaster.success(
                        `${
                            this.item.id
                                ? this.$i18n.t('common.update')
                                : this.$i18n.t('common.create')
                        } ${this.$i18n.t('holiday.holidaySuccess')}`
                    );
                }
            });
        },
        async add() {
            delete this.itemInfo.id;
            await this.updateOrCreate(this.itemInfo);
        },
        async showUpdateModal(id) {
            this.resetForm();
            await this.getInfo({ id: id });
            this.itemInfo = { ...this.item };
            this.$refs.createOrUpdateModal.show();
        },
        async update() {
            await this.updateOrCreate(this.itemInfo);
        },
        async onDelete(modal) {
            modal.preventDefault();
            await this.deleteById({ id: this.currentId });
            if (this.searchResults.length / this.perPage === this.currentPage - 1) {
                this.currentPage--;
            }
            this.$refs.deleteModal.hide();
            this.$toaster.success(this.$i18n.t('holiday.deleteMess'));
        },
        openCreateModal() {
            this.resetForm();
            this.$refs.createOrUpdateModal.show();
        },
        async confirmDelete(zoneId) {
            this.currentId = zoneId;
            this.$refs.deleteModal.show();
        },
        resetForm() {
            this.itemInfo = {};
        },
        onWindowSizeChange(e) {
            this.updatePerPage();
        },
        updatePerPage() {
            this.perPage = Math.floor(this.$refs.countBody.clientHeight / 57) - 2;
        }
    },
    created() {
        window.addEventListener('resize', this.onWindowSizeChange);
    },
    destroyed() {
        window.removeEventListener('resize', this.onWindowSizeChange);
    }
};
</script>
<style>
.timepicker-popup {
    z-index: 9999;
}
</style>
