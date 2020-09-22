<template>
    <div class="animated fadeIn h-100">
        <div class="sub-header">
            <div class="bg-gray-900 py-2">
                <div class="container-fluid">
                    <div class="d-flex justify-content-between align-items-center">
                        <h2 class="font-15 font-weight-bold mb-0">CASES</h2>
                        <div class="d-flex align-items-center">
                            <div class="input-group border-bottom position-relative">
                                <input
                                    type="text"
                                    class="form-control bg-transparent border-none text-white pr-4"
                                    placeholder="Search"
                                    aria-label="Search"
                                    aria-describedby="button-addon2"
                                />
                                <i
                                    class="fa fa-search position-absolute"
                                    aria-hidden="true"
                                    style="top: 50%;right: 4px;margin-top: -6px;"
                                ></i>
                            </div>
                            <div class="text-white mx-3 font-20">|</div>
                            <div class="d-flex align-items-center text-nowrap">
                                <span class="text-muted mr-2 text-gray-300">Sort by:</span>
                                <a href="#" class="text-white text-decoration-none">Last Created</a>
                                <span class="text-white mx-2">-</span>
                                <a href="#" class="text-gray-300 text-decoration-none"
                                    >Last Modified</a
                                >
                            </div>
                            <div class="text-white mx-3 font-20">|</div>
                            <div class="d-flex align-items-center text-nowrap">
                                <b-button variant="outline-primary" class="bg-none">
                                    <i class="fa fa-plus-circle mr-1" aria-hidden="true"></i>
                                    CREATE CASE
                                </b-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sub-header-bottom">
                <!---->
                <div class="sub-header-border-one"></div>
                <!---->
                <div class="sub-header-border-two"></div>
            </div>
        </div>

        <div class="page-content sub-header-page-content p-4">
            <b-row v-if="cases.length">
                <template v-for="(caseItem, index) in cases">
                    <div
                        class="w-100"
                        v-if="index % CONSTANTS.CASE_LIST_PER === 0"
                        :class="{ 'mb-4': index > 0 }"
                    ></div>
                    <b-col>
                        <CaseItem :caseItem="caseItem"></CaseItem>
                    </b-col>
                </template>
                <!-- Buffer case items to make all cols have same width -->
                <b-col v-for="(i, index) in bufferCases"></b-col>
            </b-row>

            <div
                v-if="!cases.length"
                class="h-100 d-flex flex-column justify-content-center align-items-center"
            >
                <div class="mb-3 strong font-16">You currently have no case</div>
                <b-button variant="outline-primary" class="bg-none">
                    <i class="fa fa-plus-circle mr-1" aria-hidden="true"></i>
                    CREATE CASE
                </b-button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '../../constants';
import CaseItem from '../../components/CaseItem';

export default {
    components: {
        CaseItem
    },
    mounted: function() {
        this.$nextTick(function() {
            this.getCaseList();
        });
    },
    data: function() {
        return {
            CONSTANTS,
            text: ''
        };
    },
    computed: {
        ...mapState({
            cases: state => state.review.cases
        }),
        bufferCaseCount() {
            const lastRowItemCount = this.cases.length % CONSTANTS.CASE_LIST_PER;
            return lastRowItemCount === 0 ? 0 : CONSTANTS.CASE_LIST_PER - lastRowItemCount;
        },
        bufferCases() {
            return [...Array(this.bufferCaseCount).keys()];
        }
    },
    methods: {
        ...mapActions({
            getCaseList: 'review/getCaseList'
        })
    }
};
</script>
<style lang="scss" scoped>
</style>