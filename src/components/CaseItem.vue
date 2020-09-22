<template>
    <b-card
        no-body
        class="bg-dark m-0"
        :class="{ 'border-info': hover, 'border-gray-500': !hover }"
        @mouseover="hover = true"
        @mouseleave="hover = false"
    >
        <div class="d-flex flex-column border-bottom border-gray-500">
            <case-video-thumbnail
                :video="caseItem.videos[0]"
                :size="CONSTANTS.VIDEO_SNAPSHOT_SIZE.MEDIUM"
                v-if="caseItem.videos.length"
                @click="goToDetailPage"
                class="cursor-pointer border-bottom border-gray-500"
            />
            <div class="px-3 py-2" v-if="caseItem.videos.length">
                <b-row>
                    <b-col
                        cols="3"
                        v-for="caseItemVideo in caseItem.videos.slice(0, 4)"
                        class="px-xl-1"
                    >
                        <case-video-thumbnail
                            :video="caseItemVideo"
                            :size="CONSTANTS.VIDEO_SNAPSHOT_SIZE.SMALL"
                            class="border border-gray-500"
                        />
                    </b-col>
                </b-row>
            </div>

            <!-- No video image -->
            <div v-if="!caseItem.videos.length">
                <div class="ratio-16-9 position-relative">
                    <div
                        class="obsolute-full d-flex justify-content-center align-items-center flex-column"
                    >
                        <div class="mb-1">{{ $t('cases.noVideo') }}</div>
                        <b-button
                            variant="outline-primary"
                            class="bg-none border-none text-uppercase"
                            @click="$emit('addVideo')"
                        >
                            <i class="fa fa-plus-circle mr-1" aria-hidden="true"></i>
                            {{ $t('cases.addVideoShort') }}
                        </b-button>
                    </div>

                    <div class="px-3 py-2">
                        <b-row>
                            <b-col cols="3" class="px-xl-1">
                                <div class="ratio-16-9"></div>
                            </b-col>
                        </b-row>
                    </div>
                </div>
            </div>
        </div>

        <b-card-body class="text-left p-xl-2">
            <h3 class="font-17 text-uppercase" v-line-clamp="1">
                {{ caseItem.name }}
            </h3>
            <div class="mb-4 d-block">
                {{ $t('cases.caseItemCreated') }}:
                <span class="text-gray-300">
                    {{ caseItem.createdAt | formatDateTime }}
                </span>
            </div>
            <div class="text-gray-300 case-item_desc" v-line-clamp="2">
                <span v-b-tooltip.hover.top.v-light="caseItem.desc">{{ caseItem.desc }}</span>
            </div>
        </b-card-body>

        <b-card-footer
            class="border-none border-top border-gray-500 font-12 p-xl-2"
            :class="{ 'bg-black': hover, 'bg-transparent': !hover }"
        >
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    {{ $t('cases.caseItemUpdated') }}:
                    <span class="text-gray-300">
                        {{ caseItem.updatedAt | formatDateTime }}
                    </span>
                </div>

                <div class="case-item_actions">
                    <a
                        href="#"
                        class="mr-2"
                        @click="$emit('editCase')"
                        v-b-tooltip.hover
                        :title="$t('cases.editCase')"
                    >
                        <i class="fa fa-pencil font-16" aria-hidden="true"></i
                    ></a>
                    <a
                        href="#"
                        @click="$emit('deleteCase')"
                        v-b-tooltip.hover
                        :title="$t('cases.deleteCase')"
                    >
                        <i class="fa fa-trash font-16" aria-hidden="true"></i
                    ></a>
                </div>
            </div>
        </b-card-footer>
    </b-card>
</template>

<script>
import CONSTANTS from '@/constants';
import CaseVideoThumbnail from '@/components/CaseVideoThumbnail';

export default {
    components: {
        CaseVideoThumbnail
    },
    props: ['caseItem'],
    data() {
        return {
            CONSTANTS,
            hover: false
        };
    },
    methods: {
        goToDetailPage() {
            this.$router.push({
                path: `/analyze-case/${this.caseItem.id}/viewer`
            });
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
