<template>
    <b-card
        no-body
        class="bg-dark m-0"
        :class="{ 'border-info': hover, 'border-gray-500': !hover }"
        @mouseover="hover = true"
        @mouseleave="hover = false"
    >
        <b-card-body class="text-left p-2">
            <b-row>
                <b-col md="5" class="pr-1">
                    <div class="border-gray-500">
                        <div
                            class="case-video-thumbnail ratio-3-4 text-center position-relative"
                            :style="{
                                'background-image': `url(${
                                    avatar !== undefined
                                        ? getImageProfileUrl(profile.id, avatar.id) + '?' + avatar.updatedAt
                                        : '/static/img/avatar-default.jpg'
                                })`
                            }"
                        />
                    </div>
                </b-col>
                <b-col md="7" class="pl-1">
                    <div>
                        {{ $t('vehicleCount.licensePlate') }}:
                        <span
                            class="text-warning"
                        >{{ plateProfile.number }}</span>
                    </div>
                    <div>
                        {{ $t('vehicleCount.owner') }}:
                        <span
                            class="text-gray-300"
                        >{{ profile.name }}</span>
                    </div>
                    <div>
                        {{ $t('report.group') }}:
                        <span class="text-gray-300">{{ profile.group }}</span>
                    </div>
                </b-col>
            </b-row>
        </b-card-body>
        <b-card-footer
            class="border-none border-top border-gray-500 font-12 px-2"
            :class="{ 'bg-black': hover, 'bg-transparent': !hover }"
        >
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    {{ $t('cases.caseItemUpdated') }}:
                    <span
                        class="text-gray-300"
                    >{{ plateProfile.updatedAt | formatDateTime }}</span>
                </div>

                <div class="case-item_actions">
                    <a
                        class="mr-2 cursor-pointer"
                        :title="$t('common.edit')"
                        @click="$emit('edit', plateProfile)"
                    >
                        <i class="fa fa-pencil font-13" aria-hidden="true"></i>
                    </a>
                    <a
                        :title="$t('common.delete')"
                        class="cursor-pointer"
                        @click="$emit('delete', plateProfile.id)"
                    >
                        <i class="fa fa-trash font-13" aria-hidden="true"></i>
                    </a>
                </div>
            </div>
        </b-card-footer>
    </b-card>
</template>
<script>
import getImageProfileUrl from '@/utils/getImageProfileUrl';

export default {
    props: {
        plateProfile: { type: Object, default: {} },
        profile: { type: Object, default: () => ({}) },
        avatar: { type: Object, default: () => {} }
    },
    data() {
        return {
            hover: false
        };
    },
    methods: {
        getImageProfileUrl
    }
};
</script>