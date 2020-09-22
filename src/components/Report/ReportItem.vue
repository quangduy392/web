<template>
    <b-card
        no-body
        class="bg-dark m-0"
        :class="{ 'border-info': hover, 'border-gray-500': !hover }"
        @mouseover="hover = true"
        @mouseleave="hover = false"
    >
        <div class="d-flex flex-column border-bottom border-gray-500">
            <div @click="goToDetailPage" class="cursor-pointer border-bottom border-gray-500">
                <div
                    class="case-video-thumbnail ratio-16-9 text-center position-relative"
                    :style="{
                        'background-image': `url(${imageUrl})`
                    }"
                />
            </div>
        </div>
        <b-card-body class="text-left p-xl-2">
            <h3 class="font-17 text-uppercase" v-line-clamp="1">
                {{ report.name }}
            </h3>
            <div class="mb-4 d-block">
                {{ $t('common.createdAt') }}:
                <span class="text-gray-300">
                    {{ report.createdAt | formatDateTime }}
                </span>
            </div>
            <div class="text-gray-300 case-item_desc" v-line-clamp="2">
                <span v-b-tooltip.hover.top.v-light="report.desc">{{ report.desc }}</span>
            </div>
        </b-card-body>

        <b-card-footer
            class="border-none border-top border-gray-500 font-12"
            :class="{ 'bg-black': hover, 'bg-transparent': !hover }"
        >
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    {{ $t('common.update') }}:
                    <span class="text-gray-300">
                        {{ report.updatedAt | formatDateTime }}
                    </span>
                </div>

                <div class="case-item_actions">
                    <a class="mr-2 cursor-pointer" title="Edit report" @click="$emit('editReport')">
                        <i class="fa fa-pencil font-16" aria-hidden="true"></i
                    ></a>
                    <a class="cursor-pointer" title="Delete report" @click="$emit('deleteReport')">
                        <i class="fa fa-trash font-16" aria-hidden="true"></i
                    ></a>
                </div>
            </div>
        </b-card-footer>
    </b-card>
</template>

<script>
import { mapActions } from 'vuex';
import getVideoSnapshotUrl from '@/utils/getVideoSnapshotUrl';
export default {
    components: {},
    props: ['report'],
    data() {
        return {
            hover: false,
            imageUrl: ''
        };
    },
    mounted() {
        this.$nextTick(async () => {
            try {
                const caseDetail = await this.getDetailCase({ caseId: this.report.caseId });
                this.imageUrl = getVideoSnapshotUrl(caseDetail[0].videoId);
            } catch (error) {}
        });
    },
    methods: {
        ...mapActions({
            getDetailCase: 'report/getCaseDetail'
        }),
        goToDetailPage() {
            this.$router.push({
                path: `/report/${this.report.id}`
            });
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
