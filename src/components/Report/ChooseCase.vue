<template>
    <div class="h-100">
        <b-row>
            <b-col cols="2" v-for="item in displayedItems" :key="item.id" class="mb-4">
                <div
                    class="add-video_video-item cursor-pointer border rounded mb-2"
                    :class="{
                        'add-video_video-item_active border-success': isSelectedCase(item.id)
                    }"
                    @click="toggleSelectCase(item)"
                >
                    <case-video-thumbnail
                        :video="item.videos[0]"
                        :size="CONSTANTS.VIDEO_SNAPSHOT_SIZE.MEDIUM"
                    />
                    <i
                        class="fa fa-3x fa-check text-success add-video_video-item_active-icon"
                        aria-hidden="true"
                    ></i>
                </div>
                {{ item.name }}
            </b-col>
        </b-row>

        <div
            v-if="isShowLoading"
            class="h-100 d-flex flex-column justify-content-center align-items-center"
        >
            <img src="/static/img/loader-green.gif" class="standalone-loading" />
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '@/constants';
import CaseVideoThumbnail from '@/components/CaseVideoThumbnail';
import moment from 'moment-timezone';
export default {
    name: 'choose-case',
    components: { CaseVideoThumbnail },
    mounted: function() {
        this.$nextTick(async function() {
            this.isShowLoading = true;
            await this.getaAnalyzeCaseList();
            this.isShowLoading = false;
        });
    },
    computed: {
        ...mapState({
            items: state => state.analyzeCase.items
        })
    },
    data() {
        return {
            CONSTANTS,
            selectedCases: [],
            isShowLoading: false,
            displayedItems: []
        };
    },
    methods: {
        ...mapActions({
            getaAnalyzeCaseList: 'analyzeCase/getList'
        }),
        isSelectedCase(caseId) {
            return this.selectedCases.find(item => item.id === caseId);
        },
        toggleSelectCase(item) {
            if (this.isSelectedCase(item.id)) {
                const removedIndex = this.selectedCases.findIndex(v => v.id === item.id);
                this.selectedCases.splice(removedIndex, 1);
            } else {
                this.selectedCases = [item];
            }
            this.$emit('updateSelectedCases', this.selectedCases);
        }
    },
    watch: {
        items() {
            this.displayedItems = _.cloneDeep(this.items.filter(item => item.videos.length > 0));
            this.displayedItems.sort((a, b) => {
                if (moment(a.createdAt).isAfter(moment(b.createdAt))) {
                    return -1;
                }
                if (moment(b.createdAt).isAfter(moment(a.createdAt))) {
                    return 1;
                }
                return 0;
            });
        }
    }
};
</script>