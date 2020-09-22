<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/alert/manage/profile" class="text-nowrap">{{
                        $t('alert.manage.profile')
                    }}</b-nav-item>
                    <b-nav-item to="/alert/manage/thief" class="text-nowrap">{{
                        $t('alert.manage.thief')
                    }}</b-nav-item>
                    <b-nav-item to="/alert/manage/stranger" class="text-nowrap">{{
                        $t('attendanceCommon.manage.stranger')
                    }}</b-nav-item>
                    <b-nav-item to="/alert/manage/region" class="text-nowrap">{{
                        $t('alert.manage.region')
                    }}</b-nav-item>
                    <b-nav-item to="/alert/manage/monitor" class="text-nowrap">{{
                        $t('alert.manage.monitor')
                    }}</b-nav-item>
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
                            <span class="text-uppercase">{{ $t('profile.createProfile') }}</span>
                        </b-button>
                    </div>
                </div>
            </template>
        </sub-header>

        <div class="page-content sub-header-page-content pb-2">
            <div class="d-flex h-100">
                <div
                    :class="[
                        'h-100 overflow-hidden flex-1 d-flex flex-column',
                        searchResults.length === 0 || isLoading
                            ? 'justify-content-center align-items-center'
                            : ''
                    ]"
                >
                    <div
                        class="overflow-y-scroll masonry-with-columns flex-1"
                        v-if="!isLoading && searchResults.length > 0"
                    >
                        <b-row class="mx-1 w-100 mt-xl-2">
                            <template v-for="(profile, index) in pagedProfileItems">
                                <b-col cols="6" md="4" lg="3" xl="2" class="mb-4 mb-xl-2 px-xl-1">
                                    <Item
                                        :profile="profile"
                                        :avatar="getAvatar(profile.id)"
                                        :imgDetect="getListDetectedImage(profile.id)"
                                        @edit="openEditModal(profile.id)"
                                        @delete="confirmDelete(profile.id)"
                                    />
                                </b-col>
                            </template>
                        </b-row>
                    </div>

                    <div v-if="isLoading">
                        <img src="/static/img/loader-green.gif" class="standalone-loading" />
                    </div>

                    <div
                        v-if="searchResults.length === 0 && !isLoading"
                        class="strong font-16 text-muted"
                    >
                        {{ $t('profile.empty') }}
                    </div>

                    <r-pagination
                        v-model="currentPage"
                        :items="searchResults"
                        :per="CONSTANTS.PROFILE_ITEM_PER"
                        @pageChanged="updatePagedItem"
                        v-if="searchResults.length"
                        v-show="!isLoading"
                    ></r-pagination>
                </div>

                <div class="case-detail_sidebar h-100">
                    <profile-filter-sidebar
                        v-model="filterCondition"
                        :items="listProfiles"
                        :filterGroups="listGroup"
                        @doFilter="doFilter"
                    />
                </div>
            </div>
        </div>

        <!-- Edit Profile Modal -->
        <b-modal
            ref="updateModal"
            :size="showDetectedImageTab ? 'xl' : 'lg'"
            :title="
                showDetectedImageTab
                    ? $t('profile.updateDetectedImgTab')
                    : $t('profile.updateProfile')
            "
            :ok-title="showDetectedImageTab ? $t('common.back') : $t('common.update')"
            :cancel-title="$t('common.cancel')"
            :ok-variant="showDetectedImageTab ? 'secondary' : 'primary'"
            :ok-only="showDetectedImageTab"
            @ok="handleOk"
            @cancel="handleCancel"
            @close="handleCancel"
            no-close-on-esc
            no-close-on-backdrop
            :body-class="showDetectedImageTab ? 'body-detected-image' : ''"
        >
            <b-row v-show="!showDetectedImageTab">
                <b-col md="4">
                    <div class="cursor-pointer border-bottom border-gray-500">
                        <div
                            @mouseover="avatarHover = true"
                            @mouseleave="avatarHover = false"
                            class="case-video-thumbnail ratio-3-4 text-center position-relative"
                            :style="{
                                'background-image': `url(${imageData})`
                            }"
                        >
                            <div class="bg-ava-hover text-center" v-if="avatarHover">
                                <b-button
                                    variant="link"
                                    class="text-decoration-none"
                                    @click="uploadImage"
                                >
                                    <div>
                                        <i class="font-20 fa fa-camera"></i>
                                    </div>
                                    <div class="font-15 text-center">{{ $t('common.update') }}</div>
                                </b-button>
                            </div>
                        </div>
                        <b-form-file
                            style="display: none;"
                            id="selectAvatar"
                            v-model="avatarImage"
                            class="mt-3"
                            accept=".jpg"
                        ></b-form-file>
                    </div>

                    <div class="px-3 py-2">
                        <b-row v-if="getListDetectedImage(form.id).length !== 0">
                            <b-col
                                cols="3"
                                v-for="item in getListDetectedImage(form.id).slice(0, 3)"
                                class="px-xl-1"
                            >
                                <div
                                    class="case-video-thumbnail ratio-3-4 text-center position-relative"
                                    :style="{
                                        'background-image': `url(${getImageProfileUrl(
                                            form.id,
                                            item.id
                                        )})`
                                    }"
                                />
                            </b-col>
                            <b-col cols="3" class="px-xl-1">
                                <div
                                    class="case-video-thumbnail ratio-3-4 text-center position-relative border"
                                    :class="{
                                        'border-info': addDetectImgHover,
                                        'border-gray-500': !addDetectImgHover
                                    }"
                                    @mouseover="addDetectImgHover = true"
                                    @mouseleave="addDetectImgHover = false"
                                >
                                    <div
                                        class="obsolute-full d-flex justify-content-center align-items-center flex-column"
                                    >
                                        <b-button
                                            variant="link"
                                            v-b-tooltip.hover
                                            @click="openDetectedImg(form.id)"
                                            :title="$t('profile.seeMoreImg')"
                                            class="bg-none border-none text-uppercase"
                                        >
                                            <i class="fa fa-angle-right font-20"></i>
                                        </b-button>
                                    </div>
                                </div>
                            </b-col>
                        </b-row>

                        <b-row v-if="getListDetectedImage(form.id).length === 0">
                            <b-col cols="3" class="px-xl-1">
                                <div
                                    class="case-video-thumbnail ratio-3-4 text-center position-relative border"
                                    :class="{
                                        'border-info': addDetectImgHover,
                                        'border-gray-500': !addDetectImgHover
                                    }"
                                    @mouseover="addDetectImgHover = true"
                                    @mouseleave="addDetectImgHover = false"
                                >
                                    <div
                                        class="obsolute-full d-flex justify-content-center align-items-center flex-column"
                                    >
                                        <b-button
                                            variant="link"
                                            v-b-tooltip.hover
                                            @click="showDetectedImageTab = true"
                                            :title="$t('profile.adđDetectedImg')"
                                            class="bg-none border-none text-uppercase"
                                        >
                                            <i class="fa fa-plus font-20"></i>
                                        </b-button>
                                    </div>
                                </div>
                            </b-col>
                        </b-row>
                    </div>
                </b-col>
                <b-col md="8">
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
                    <b-form-group :label="$t('user.group')">
                        <vue-simple-suggest
                            v-model="form.group"
                            :list="listGroup"
                            :styles="autoCompleteStyle"
                            :filter-by-query="true"
                            :placeholder="$t('user.group')"
                        ></vue-simple-suggest>
                    </b-form-group>
                    <b-form-group :label="$t('profile.code')">
                        <b-form-input
                            maxlength="255"
                            v-model="form.number"
                            :placeholder="$t('profile.code')"
                        ></b-form-input>
                    </b-form-group>
                    <b-form-group :label="`${$t('common.description')} ${$t('common.optional')}`">
                        <b-form-input
                            maxlength="255"
                            v-model="form.desc"
                            :placeholder="$t('common.description')"
                        ></b-form-input>
                    </b-form-group>
                    <b-form-group>
                        <b-form-checkbox id="follow-checkbox" v-model="form.active">
                            <b-badge
                                class="text-uppercase font-13 cursor-pointer"
                                variant="warning"
                                >{{ $t('profile.follow') }}</b-badge
                            >
                        </b-form-checkbox>
                    </b-form-group>
                </b-col>
            </b-row>

            <div v-show="showDetectedImageTab">
                <b-row v-if="listDetectedItem.length > 0">
                    <b-col cols="2" v-for="item in listDetectedItem" class="px-xl-1 mb-2">
                        <div
                            class="case-video-thumbnail ratio-3-4 text-center position-relative border border-gray-500"
                            :style="{
                                'background-image': `url(${getImageProfileUrl(form.id, item.id)})`
                            }"
                        />
                        <span
                            class="icon-del profile cursor-pointer text-gray-300"
                            @click="confirmDeleteImage(item.id)"
                            v-b-tooltip.hover
                            :title="$t('common.delete')"
                        >
                            <img
                                src="static/icon/stranger/trash-alt-icon.png"
                                width="15"
                                height="19"
                                alt="delete"
                            />
                        </span>
                    </b-col>
                    <b-col cols="2" class="px-xl-1">
                        <div
                            class="case-video-thumbnail ratio-3-4 text-center position-relative border"
                            :class="{
                                'border-info': addDetectImgHover,
                                'border-gray-500': !addDetectImgHover
                            }"
                            @mouseover="addDetectImgHover = true"
                            @mouseleave="addDetectImgHover = false"
                            v-on:drop="dropDetectedImage"
                            @dragover="
                                evt => {
                                    evt.preventDefault();
                                }
                            "
                            @dragenter="
                                evt => {
                                    evt.preventDefault();
                                }
                            "
                        >
                            <div
                                class="obsolute-full d-flex justify-content-center align-items-center flex-column"
                            >
                                <b-button
                                    variant="link"
                                    v-b-tooltip.hover
                                    @click="addDetectedImg"
                                    :title="$t('profile.adđDetectedImg')"
                                    class="bg-none border-none text-uppercase"
                                >
                                    <i class="fa fa-plus font-20"></i>
                                </b-button>
                            </div>
                        </div>
                    </b-col>
                </b-row>

                <b-row v-if="listDetectedItem.length === 0">
                    <b-col cols="2" class="px-xl-1">
                        <div
                            class="case-video-thumbnail ratio-3-4 text-center position-relative border"
                            :class="{
                                'border-info': addDetectImgHover,
                                'border-gray-500': !addDetectImgHover
                            }"
                            @mouseover="addDetectImgHover = true"
                            @mouseleave="addDetectImgHover = false"
                            v-on:drop="dropDetectedImage"
                            @dragover="
                                evt => {
                                    evt.preventDefault();
                                }
                            "
                            @dragenter="
                                evt => {
                                    evt.preventDefault();
                                }
                            "
                        >
                            <div
                                class="obsolute-full d-flex justify-content-center align-items-center flex-column"
                            >
                                <b-button
                                    variant="link"
                                    v-b-tooltip.hover
                                    @click="addDetectedImg"
                                    :title="$t('profile.adđDetectedImg')"
                                    class="bg-none border-none text-uppercase"
                                >
                                    <i class="fa fa-plus font-20"></i>
                                </b-button>
                            </div>
                        </div>
                    </b-col>
                </b-row>
                <b-form-file
                    style="display: none;"
                    id="selectDetectedImg"
                    v-model="detectedImage"
                    multiple
                    class="mt-3"
                    accept=".jpg"
                ></b-form-file>
            </div>
        </b-modal>

        <!-- Create Profile Modal -->
        <b-modal
            ref="createModal"
            :size="showDetectedImageTab ? 'xl' : 'lg'"
            :title="
                showDetectedImageTab
                    ? $t('profile.updateDetectedImgTab')
                    : $t('profile.createProfile')
            "
            :ok-title="showDetectedImageTab ? $t('common.back') : $t('common.create')"
            :cancel-title="$t('common.cancel')"
            :ok-variant="showDetectedImageTab ? 'secondary' : 'primary'"
            :ok-only="showDetectedImageTab"
            @ok="handleOk"
            @cancel="handleCancel"
            @close="handleCancel"
            no-close-on-esc
            no-close-on-backdrop
            :body-class="showDetectedImageTab ? 'body-detected-image' : ''"
        >
            <b-row v-show="!showDetectedImageTab">
                <b-col md="4">
                    <div class="cursor-pointer border-bottom border-gray-500">
                        <div
                            @mouseover="avatarHover = true"
                            @mouseleave="avatarHover = false"
                            class="case-video-thumbnail ratio-3-4 text-center position-relative"
                            :style="{
                                'background-image': `url(${imageData})`
                            }"
                        >
                            <div class="bg-ava-hover text-center" v-if="avatarHover">
                                <b-button
                                    variant="link"
                                    class="text-decoration-none"
                                    @click="uploadImage"
                                >
                                    <div>
                                        <i class="font-20 fa fa-camera"></i>
                                    </div>
                                    <div class="font-15 text-center">{{ $t('common.update') }}</div>
                                </b-button>
                            </div>
                        </div>
                        <b-form-file
                            style="display: none;"
                            id="selectAvatar"
                            v-model="avatarImage"
                            class="mt-3"
                            accept=".jpg"
                        ></b-form-file>
                    </div>

                    <div class="px-3 py-2">
                        <b-row v-if="listDetectedImageTempData.length !== 0">
                            <b-col
                                cols="3"
                                v-for="item in listDetectedImageTempData.slice(0, 3)"
                                class="px-xl-1"
                            >
                                <div
                                    class="case-video-thumbnail ratio-3-4 text-center position-relative"
                                    :style="{
                                        'background-image': `url(${item})`
                                    }"
                                />
                            </b-col>
                            <b-col cols="3" class="px-xl-1">
                                <div
                                    class="case-video-thumbnail ratio-3-4 text-center position-relative border"
                                    :class="{
                                        'border-info': addDetectImgHover,
                                        'border-gray-500': !addDetectImgHover
                                    }"
                                    @mouseover="addDetectImgHover = true"
                                    @mouseleave="addDetectImgHover = false"
                                >
                                    <div
                                        class="obsolute-full d-flex justify-content-center align-items-center flex-column"
                                    >
                                        <b-button
                                            variant="link"
                                            v-b-tooltip.hover
                                            @click="openDetectedImg(form.id)"
                                            :title="$t('profile.seeMoreImg')"
                                            class="bg-none border-none text-uppercase"
                                        >
                                            <i class="fa fa-angle-right font-20"></i>
                                        </b-button>
                                    </div>
                                </div>
                            </b-col>
                        </b-row>

                        <b-row v-if="listDetectedImageTempData.length === 0">
                            <b-col cols="3" class="px-xl-1">
                                <div
                                    class="case-video-thumbnail ratio-3-4 text-center position-relative border"
                                    :class="{
                                        'border-info': addDetectImgHover,
                                        'border-gray-500': !addDetectImgHover
                                    }"
                                    @mouseover="addDetectImgHover = true"
                                    @mouseleave="addDetectImgHover = false"
                                >
                                    <div
                                        class="obsolute-full d-flex justify-content-center align-items-center flex-column"
                                    >
                                        <b-button
                                            variant="link"
                                            v-b-tooltip.hover
                                            @click="showDetectedImageTab = true"
                                            :title="$t('profile.adđDetectedImg')"
                                            class="bg-none border-none text-uppercase"
                                        >
                                            <i class="fa fa-plus font-20"></i>
                                        </b-button>
                                    </div>
                                </div>
                            </b-col>
                        </b-row>
                    </div>
                </b-col>
                <b-col md="8">
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
                    <b-form-group :label="$t('user.group')">
                        <vue-simple-suggest
                            v-model="form.group"
                            :list="listGroup"
                            :styles="autoCompleteStyle"
                            :filter-by-query="true"
                            :placeholder="$t('user.group')"
                        ></vue-simple-suggest>
                    </b-form-group>
                    <b-form-group :label="$t('profile.code')">
                        <b-form-input
                            maxlength="255"
                            v-model="form.number"
                            :placeholder="$t('profile.code')"
                        ></b-form-input>
                    </b-form-group>
                    <b-form-group :label="`${$t('common.description')} ${$t('common.optional')}`">
                        <b-form-input
                            maxlength="255"
                            v-model="form.desc"
                            :placeholder="$t('common.description')"
                        ></b-form-input>
                    </b-form-group>
                    <b-form-group>
                        <b-form-checkbox id="follow-checkbox" v-model="form.active">
                            <b-badge
                                class="text-uppercase font-13 cursor-pointer"
                                variant="warning"
                                >{{ $t('profile.follow') }}</b-badge
                            >
                        </b-form-checkbox>
                    </b-form-group>
                </b-col>
            </b-row>

            <div v-show="showDetectedImageTab">
                <b-row v-if="listDetectedImageTempData.length > 0">
                    <b-col
                        cols="2"
                        v-for="(item, index) in listDetectedImageTempData"
                        class="px-xl-1 mb-2"
                    >
                        <div
                            class="case-video-thumbnail ratio-3-4 text-center position-relative border border-gray-500"
                            :style="{
                                'background-image': `url(${item})`
                            }"
                        />
                        <span
                            class="icon-del profile cursor-pointer text-gray-300"
                            @click="confirmDeleteImageDetected(index)"
                            v-b-tooltip.hover
                            :title="$t('common.delete')"
                        >
                            <img
                                src="static/icon/stranger/trash-alt-icon.png"
                                width="15"
                                height="19"
                                alt="delete"
                            />
                        </span>
                    </b-col>
                    <b-col cols="2" class="px-xl-1">
                        <div
                            class="case-video-thumbnail ratio-3-4 text-center position-relative border"
                            :class="{
                                'border-info': addDetectImgHover,
                                'border-gray-500': !addDetectImgHover
                            }"
                            @mouseover="addDetectImgHover = true"
                            @mouseleave="addDetectImgHover = false"
                            v-on:drop="dropDetectedImageTemp"
                            @dragover="
                                evt => {
                                    evt.preventDefault();
                                }
                            "
                            @dragenter="
                                evt => {
                                    evt.preventDefault();
                                }
                            "
                        >
                            <div
                                class="obsolute-full d-flex justify-content-center align-items-center flex-column"
                            >
                                <b-button
                                    variant="link"
                                    v-b-tooltip.hover
                                    @click="addDetectedImgTemp"
                                    :title="$t('profile.adđDetectedImg')"
                                    class="bg-none border-none text-uppercase"
                                >
                                    <i class="fa fa-plus font-20"></i>
                                </b-button>
                            </div>
                        </div>
                    </b-col>
                </b-row>

                <b-row v-if="listDetectedImageTempData.length === 0">
                    <b-col cols="2" class="px-xl-1">
                        <div
                            class="case-video-thumbnail ratio-3-4 text-center position-relative border"
                            :class="{
                                'border-info': addDetectImgHover,
                                'border-gray-500': !addDetectImgHover
                            }"
                            @mouseover="addDetectImgHover = true"
                            @mouseleave="addDetectImgHover = false"
                            v-on:drop="dropDetectedImageTemp"
                            @dragover="
                                evt => {
                                    evt.preventDefault();
                                }
                            "
                            @dragenter="
                                evt => {
                                    evt.preventDefault();
                                }
                            "
                        >
                            <div
                                class="obsolute-full d-flex justify-content-center align-items-center flex-column"
                            >
                                <b-button
                                    variant="link"
                                    v-b-tooltip.hover
                                    @click="addDetectedImgTemp"
                                    :title="$t('profile.adđDetectedImg')"
                                    class="bg-none border-none text-uppercase"
                                >
                                    <i class="fa fa-plus font-20"></i>
                                </b-button>
                            </div>
                        </div>
                    </b-col>
                </b-row>
                <b-form-file
                    style="display: none;"
                    id="selectDetectedImgTemp"
                    v-model="detectImageTemp"
                    multiple
                    accept=".jpg"
                ></b-form-file>
            </div>
        </b-modal>

        <!-- Confirm Delete User -->
        <b-modal
            ref="confirmDeleteModal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="onDelete"
        >
            {{
                showDetectedImageTab
                    ? $t('profile.confirmDeleteDetectedImg')
                    : $t('profile.confirmDeleteProfile')
            }}
        </b-modal>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '@/constants';
import Item from '@/components/Profile/Item';
import getImageProfileUrl from '@/utils/getImageProfileUrl';
import VueSimpleSuggest from 'vue-simple-suggest';
import ProfileFilterSidebar from '@/components/ProfileFilterSidebar';
import 'vue-simple-suggest/dist/styles.css';
import changeAlias from '@/utils/changeAlias';

export default {
    components: {
        Item,
        VueSimpleSuggest,
        ProfileFilterSidebar
    },
    mounted: function() {
        this.$nextTick(function() {
            this.initData();
        });
    },
    data: function() {
        return {
            isLoading: true,
            avatarImage: null,
            detectedImage: [],
            form: {
                id: null,
                name: '',
                desc: '',
                number: '',
                group: '',
                active: false
            },
            autoCompleteStyle: {
                suggestItem: 'text-dark bg-white'
            },
            currentProfileId: null,
            currentImageId: null,
            CONSTANTS,
            avatarHover: false,
            addDetectImgHover: false,
            listGroup: [],
            imageData: null,
            listDetectedItem: [],
            showDetectedImageTab: false,
            filterCondition: null,
            filterGroups: [],
            fiteredProfile: [],
            currentPage: 1,
            pagedProfileItems: [],
            listDetectedImageTemp: [],
            listDetectedImageTempData: [],
            detectImageTemp: [],
            searchKeyword: null
        };
    },
    computed: {
        ...mapState({
            listProfiles: state => state.profile.items,
            profileInfo: state => state.profile.item,
            listAllImages: state => state.profile.listAllImages
        }),
        searchResults() {
            if (this.searchKeyword) {
                return this.fiteredProfile.filter(profile => {
                    const keyword = changeAlias(this.searchKeyword.toLowerCase());
                    const profileName = changeAlias(profile.name.toLowerCase());
                    return profileName.indexOf(keyword) > -1;
                });
            }
            return this.fiteredProfile;
        }
    },
    watch: {
        avatarImage() {
            const reader = new FileReader();
            reader.onload = e => {
                this.imageData = e.target.result;
            };
            if (this.avatarImage) {
                reader.readAsDataURL(this.avatarImage);
            }
        },
        detectedImage() {
            if (this.detectedImage.length > 0) {
                for (const key in this.detectedImage) {
                    this.uploadDetectedImg({
                        id: this.form.id,
                        data: this.detectedImage[key]
                    }).then(response => {
                        this.listDetectedItem.push(response.data);
                        this.detectedImage = [];
                    });
                }
            }
        },
        detectImageTemp() {
            for (let i = 0; i < this.detectImageTemp.length; i++) {
                this.setupReader(this.detectImageTemp[i]);
                this.listDetectedImageTemp.push(this.detectImageTemp[i]);
            }
        }
    },
    methods: {
        ...mapActions({
            getListProfiles: 'profile/getList',
            deleteProfile: 'profile/delete',
            updateOrCreate: 'profile/updateOrCreate',
            getProfile: 'profile/getProfile',
            uploadAvatar: 'profile/uploadAvatar',
            uploadDetectedImg: 'profile/uploadDetectedImg',
            getImageProfile: 'profile/getImageProfile',
            deleteImage: 'profile/deleteImage'
        }),
        dropDetectedImage(evt) {
            this.detectedImage = [...evt.dataTransfer.files];
            evt.preventDefault();
        },
        dropDetectedImageTemp(evt) {
            this.detectImageTemp = [...evt.dataTransfer.files];
            evt.preventDefault();
        },
        setupReader(file) {
            const reader = new FileReader();
            reader.onload = e => {
                // get file content
                this.listDetectedImageTempData.push(e.target.result);
            };
            if (file) {
                reader.readAsDataURL(file);
            }
        },
        doFilter(value) {
            this.fiteredProfile = value;
        },
        getListDetectedImage(id) {
            const tmp = this.listAllImages.filter(
                el => el.profileId === id && el.portrait === false
            );
            if (tmp) return tmp;
        },
        getAvatar(id) {
            const tmp = this.listAllImages.find(el => el.profileId === id && el.portrait === true);
            if (tmp) return tmp;
        },
        getImageProfileUrl,
        openCreateModal() {
            this.resetForm();
            this.resetDataImageDetected();
            this.$refs.createModal.show();
        },
        async openEditModal(profileId) {
            this.resetForm();
            this.resetDataImageDetected();
            await this.getProfile({ id: profileId, type: 'suspect' });
            this.form = { ...this.profileInfo };
            if (this.getAvatar(profileId)) {
                this.imageData =
                    this.getImageProfileUrl(profileId, this.getAvatar(profileId).id) +
                    '?' +
                    this.getAvatar(profileId).updatedAt;
            } else {
                this.imageData = '/static/img/avatar-default.jpg';
            }
            this.$refs.updateModal.show();
        },
        confirmDelete(id) {
            this.currentProfileId = id;
            this.$refs.confirmDeleteModal.show();
        },
        updatePagedItem(pagedItems) {
            this.pagedProfileItems = pagedItems;
        },
        async onDelete(modal) {
            modal.preventDefault();
            if (this.showDetectedImageTab === true) {
                await this.deleteImage({
                    id: this.currentImageId,
                    type: 'suspect'
                });
                this.listDetectedItem.forEach((element, index) => {
                    if (element.id === this.currentImageId) {
                        this.listDetectedItem.splice(index, 1);
                    }
                });
                this.$toaster.success(this.$t('profile.deleteImgMess'));
            } else {
                await this.deleteProfile({ id: this.currentProfileId });
                this.$toaster.success(this.$t('profile.deleteProfileMess'));
            }
            this.$refs.confirmDeleteModal.hide();
        },
        openDetectedImg(profileId) {
            this.showDetectedImageTab = true;
            this.listDetectedItem = this.getListDetectedImage(profileId);
        },
        confirmDeleteImage(id) {
            this.currentImageId = id;
            this.$refs.confirmDeleteModal.show();
        },
        confirmDeleteImageDetected(index) {
            this.listDetectedImageTempData.splice(index, 1);
            this.listDetectedImageTemp.splice(index, 1);
        },
        async handleOk(modal) {
            modal.preventDefault();
            if (this.showDetectedImageTab) {
                await this.getImageProfile({ type: 'suspect' });
                this.showDetectedImageTab = false;
            } else {
                this.onSubmit();
            }
        },
        async handleCancel(modal) {
            if (this.showDetectedImageTab) {
                modal.preventDefault();
                await this.getImageProfile({ type: 'suspect' });
                this.listDetectedItem = [];
                this.showDetectedImageTab = false;
            }
        },
        resetForm() {
            this.form = {};
            this.form.active = false;
            this.imageData = '/static/img/avatar-default.jpg';
            this.avatarImage = null;
        },
        resetDataImageDetected() {
            this.detectImageTemp = [];
            this.listDetectedImageTempData = [];
            this.listDetectedImageTemp = [];
            this.listDetectedItem = [];
            this.showDetectedImageTab = false;
        },
        uploadImage() {
            document.getElementById('selectAvatar').click();
        },
        addDetectedImg() {
            document.getElementById('selectDetectedImg').click();
        },
        addDetectedImgTemp() {
            document.getElementById('selectDetectedImgTemp').click();
        },
        onSubmit() {
            this.$validator.validateAll().then(result => {
                if (result && this.form.group && this.form.group !== '') {
                    this.submitForm();
                } else this.$toaster.error(this.$t('profile.groupErrorMess'));
            });
        },
        async submitForm() {
            if (this.form.id) {
                await this.updateOrCreate({ ...this.form, type: 'suspect' });
                this.$refs.updateModal.hide();
                this.$toaster.success(
                    `${this.$i18n.t('common.update')} ${this.$i18n.t('profile.profileSuccess')}`
                );
                if (this.avatarImage !== null) {
                    this.uploadAvatar({ id: this.form.id, data: this.avatarImage }).then(() => {
                        this.getImageProfile({ type: 'suspect' });
                    });
                }
            } else {
                await this.updateOrCreate({ ...this.form, type: 'suspect' });
                if (this.avatarImage !== null) {
                    this.uploadAvatar({
                        id: this.listProfiles[this.listProfiles.length - 1].id,
                        data: this.avatarImage
                    }).then(() => {
                        this.getImageProfile({ type: 'suspect' });
                    });
                }
                Promise.all(
                    this.listDetectedImageTemp.map(item => {
                        return this.uploadDetectedImg({
                            id: this.listProfiles[this.listProfiles.length - 1].id,
                            data: item
                        });
                    })
                ).then(() => {
                    this.getImageProfile({ type: 'suspect' });
                });
                this.$refs.createModal.hide();
                this.$toaster.success(
                    `${this.$i18n.t('common.create')} ${this.$i18n.t('profile.profileSuccess')}`
                );
            }
        },
        async initData() {
            this.getImageProfile({ type: 'suspect' });
            await this.getListProfiles({ type: 'suspect' });
            this.isLoading = false;
            this.listProfiles.forEach(element => {
                if (this.listGroup.indexOf(element.group) === -1) {
                    this.listGroup.push(element.group);
                }
            });
        }
    }
};
</script>
<style lang="scss" scoped></style>
