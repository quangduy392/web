<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/management/user/group" class="text-nowrap">{{
                        $t('groups.users')
                    }}</b-nav-item>
                    <b-nav-item to="/management/user/user" class="text-nowrap">{{
                        $t('user.user')
                    }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
            <template slot="sub-header-right">
                <b-button variant="outline-primary" @click="openCreateModal">
                    <i class="fa fa-plus-circle mr-2"></i>
                    <span class="text-uppercase">{{ $t('user.createUser') }}</span>
                </b-button>
            </template>
        </sub-header>
        <div class="page-content sub-header-page-content p-4">
            <b-table
                striped
                hover
                dark
                :items="listUsers"
                :current-page="currentPage"
                :per-page="CONSTANTS.ITEM_PER_PAGE"
                :fields="fields"
                show-empty
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
            >
                <template slot="index" slot-scope="data">{{
                    (currentPage - 1) * CONSTANTS.ITEM_PER_PAGE + (data.index + 1)
                }}</template>
                <template slot="enabled" slot-scope="data">
                    <b-badge :variant="data.value == true ? 'success' : 'secondary'">
                        {{ data.value == true ? 'ACTIVE' : 'INACTIVE' }}
                    </b-badge>
                </template>
                <template slot="createdAt" slot-scope="data">
                    <span>{{ data.value | formatDateTime }}</span>
                </template>
                <template slot="groupId" slot-scope="row">
                    <span>{{ groupName[row.value] }}</span>
                </template>
                <template slot="actions" slot-scope="row">
                    <b-button
                        variant="primary"
                        class="mr-1 min-width-none"
                        @click="openEditModal(row.item.id)"
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
                        <span>{{ $t('user.empty') }}</span>
                    </div>
                </template>
            </b-table>
            <div v-if="countRow > CONSTANTS.ITEM_PER_PAGE" class="my-1">
                <b-pagination
                    v-model="currentPage"
                    :total-rows="countRow"
                    :per-page="CONSTANTS.ITEM_PER_PAGE"
                    :hide-goto-end-buttons="true"
                    :prev-text="$t('common.prevPage')"
                    :next-text="$t('common.nextPage')"
                    class="my-0"
                    align="center"
                ></b-pagination>
            </div>
        </div>
        <!-- Create/Edit User -->
        <b-modal
            ref="createOrUpdateUserModal"
            size="lg"
            :ok-title="`${form.id ? $t('common.update') : $t('common.create')}`"
            :title="`${form.id ? $t('user.updateUser') : $t('user.createUser')}`"
            @ok="handleCreateUserOk"
            :cancel-title="$t('common.cancel')"
        >
            <b-form-group :label="$t('user.fullName')">
                <b-form-input
                    maxlength="255"
                    v-model="form.name"
                    v-validate="'required'"
                    :placeholder="$t('user.fullName')"
                    name="name"
                    :data-vv-as="$t('user.fullName')"
                ></b-form-input>
                <div v-show="errors.has('name')" class="validation-message text-danger">
                    {{ errors.first('name') }}
                </div>
            </b-form-group>
            <b-form-group label="Email:">
                <b-form-input
                    maxlength="255"
                    v-model="form.email"
                    type="email"
                    v-validate="'required'"
                    placeholder="Email"
                    name="email"
                    data-vv-as="Email"
                    :disabled="form.id != null"
                ></b-form-input>
                <div v-show="errors.has('email')" class="validation-message text-danger">
                    {{ errors.first('email') }}
                </div>
            </b-form-group>
            <b-form-group :label="$t('user.password')">
                <b-form-input
                    maxlength="255"
                    v-model="form.password"
                    type="password"
                    :placeholder="$t('user.password')"
                    name="pass"
                    :data-vv-as="$t('user.password')"
                ></b-form-input>
            </b-form-group>
            <b-form-group :label="$t('user.phone')">
                <b-form-input
                    maxlength="255"
                    v-model="form.phone"
                    :placeholder="$t('user.phone')"
                    name="phone"
                ></b-form-input>
            </b-form-group>

            <b-form-group :label="$t('user.group')">
                <b-form-select
                    v-model="form.groupId"
                    v-validate="'required'"
                    name="group"
                    :data-vv-as="$t('user.group')"
                >
                    <option :value="null">{{ $t('user.chooseGroup') }}</option>
                    <option v-for="group in listGroups" :value="group.id">{{ group.name }}</option>
                </b-form-select>
                <div v-show="errors.has('group')" class="validation-message text-danger">
                    {{ errors.first('group') }}
                </div>
            </b-form-group>

            <b-form-group :label="$t('user.status')">
                <b-form-radio-group v-model="form.enabled" name="radio">
                    <b-form-radio v-bind:value="true">
                        <b-badge variant="success">ACTIVE</b-badge>
                    </b-form-radio>
                    <b-form-radio v-bind:value="false">
                        <b-badge variant="secondary">INACTIVE</b-badge>
                    </b-form-radio>
                </b-form-radio-group>
            </b-form-group>

            <b-form-group :label="$t('user.permission')">
                <b-form-checkbox-group v-model="form.functions">
                    <b-form-checkbox
                        v-for="(func, index) in listFunctions"
                        :key="index"
                        :value="func.function"
                        class="mr-3"
                        >{{ locale === 'vi' ? func.textVN : func.textEN }}</b-form-checkbox
                    >
                </b-form-checkbox-group>
            </b-form-group>
        </b-modal>

        <!-- Confirm Delete User -->
        <b-modal
            ref="deleteUserModal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="onDeleteUser"
            >{{ $t('user.deleteConfirmMsg') }}</b-modal
        >
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import ManageSubNav from '../ManageSubNav';
import CONSTANTS from '../../../constants';
import { i18n } from '../../../main';
export default {
    mounted: function() {
        this.$nextTick(function() {
            this.initData();
        });
    },
    components: {
        ManageSubNav
    },
    data: function() {
        return {
            sortBy: 'groupId',
            sortDesc: false,
            fields: [
                { tdClass: 'align-middle', key: 'index', label: '#' },
                {
                    tdClass: 'align-middle',
                    key: 'name',
                    label: this.$i18n.t('user.fullName'),
                    sortable: true
                },
                { tdClass: 'align-middle', key: 'email', label: 'Email', sortable: true },
                {
                    tdClass: 'align-middle',
                    key: 'groupId',
                    label: this.$i18n.t('user.group'),
                    sortable: true
                },
                { tdClass: 'align-middle', key: 'phone', label: this.$i18n.t('user.phone') },
                { tdClass: 'align-middle', key: 'enabled', label: this.$i18n.t('user.status') },
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
            form: {
                email: '',
                name: '',
                phone: '',
                groupId: null,
                functions: [],
                password: null,
                enabled: true
            },
            showModalConfirm: false,
            currentUserId: null,
            CONSTANTS,
            currentPage: 1
        };
    },
    computed: {
        ...mapState({
            listGroups: state => state.group.groups,
            listUsers: state => state.user.users,
            listFunctions: state => state.user.functions,
            userInfo: state => state.user.user
        }),
        countRow() {
            return this.listUsers.length;
        },
        locale() {
            return i18n.locale;
        },
        groupName() {
            const group = {};
            this.listGroups.forEach(element => {
                group[element.id] = element.name;
            });
            return group;
        }
    },
    methods: {
        ...mapActions({
            getListGroups: 'group/getListGroups',
            getListUsers: 'user/getListUsers',
            getAllFunctions: 'user/getAllFunctions',
            getUserInfo: 'user/getUserInfo',
            createNewUser: 'user/createNewUser',
            deleteUserById: 'user/deleteUserById',
            updateUserInfo: 'user/updateUserInfo',
            updateUserInfoAdmin: 'user/updateUserInfoAdmin',
            getCurrentUserDetail: 'auth/getCurrentUserDetail'
        }),
        handleCreateUserOk(modal) {
            modal.preventDefault();
            this.onSubmit();
        },
        onSubmit() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    this.submitForm();
                }
            });
        },
        async onDeleteUser(modal) {
            modal.preventDefault();
            await this.deleteUserById({ id: this.currentUserId });
            if (this.listUsers.length / this.CONSTANTS.ITEM_PER_PAGE === this.currentPage - 1) {
                this.currentPage--;
            }
            this.$refs.deleteUserModal.hide();
            this.$toaster.success(this.$i18n.t('user.deleteUserMess'));
        },
        async openEditModal(userId) {
            this.resetForm();
            await this.getUserInfo({ id: userId });
            this.form = { ...this.userInfo };
            this.form.password = null;
            this.$refs.createOrUpdateUserModal.show();
        },
        openCreateModal() {
            this.resetForm();
            this.$refs.createOrUpdateUserModal.show();
        },
        confirmDelete(userId) {
            this.currentUserId = userId;
            this.$refs.deleteUserModal.show();
        },
        resetForm() {
            this.form = {};
            this.form.groupId = null;
            this.form.enabled = true;
            this.form.functions = [];
        },
        initData() {
            this.getListUsers();
            this.getListGroups();
            this.getAllFunctions();
        },
        async submitForm() {
            this.form.functions.sort();
            if (this.userInfo.id) {
                if (this.form.password == null) {
                    delete this.form.password;
                    delete this.form.email;
                    await this.updateUserInfoAdmin(this.form);
                } else {
                    await this.updateUserInfo(this.form);
                }
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                currentUser.userDetail.functions = { ...this.form.functions };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                this.getCurrentUserDetail();
            } else {
                await this.createNewUser(this.form);
            }
            this.$toaster.success(
                `${
                    this.userInfo.id ? this.$i18n.t('common.update') : this.$i18n.t('common.create')
                } ${this.$i18n.t('user.userSuccess')}`
            );
            this.$refs.createOrUpdateUserModal.hide();
        }
    }
};
</script>
<style lang="scss" scoped></style>
