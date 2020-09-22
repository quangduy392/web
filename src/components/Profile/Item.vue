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
                <b-col md="5" class="pr-1 cursor-pointer" @click="$emit('edit')">
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
                    <h3
                        class="font-15 text-uppercase profile-item_code"
                        :class="profile.active ? 'text-warning' : ''"
                        v-line-clamp="2"
                    >{{ resizeProfileName(profile.name) }}</h3>
                    <div class="mb-1" v-line-clamp="1">
                        {{ $t('profile.code') }}:
                        <span class="text-gray-300">{{ profile.number }}</span>
                    </div>
                    {{ $t('common.description') }}:
                    <div class="case-item_desc" v-line-clamp="2">
                        <span
                            class="text-gray-300"
                            v-b-tooltip.hover.top.v-light="profile.desc"
                        >{{ profile.desc }}</span>
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
                    >{{ profile.updatedAt | formatDateTime }}</span>
                </div>

                <div class="case-item_actions">
                    <a
                        class="mr-2 cursor-pointer"
                        :title="$t('common.edit')"
                        @click="$emit('edit')"
                    >
                        <i class="fa fa-pencil font-13" aria-hidden="true"></i>
                    </a>
                    <a :title="$t('common.delete')" class="cursor-pointer" @click="$emit('delete')">
                        <i class="fa fa-trash font-13" aria-hidden="true"></i>
                    </a>
                </div>
            </div>
        </b-card-footer>
    </b-card>
</template>
<script>
import CONSTANTS from '@/constants';
import getImageProfileUrl from '@/utils/getImageProfileUrl';
export default {
    components: {},
    props: ['profile', 'avatar', 'imgDetect'],
    name: 'item',
    data() {
        return {
            CONSTANTS,
            hover: false
        };
    },
    methods: {
        getImageProfileUrl,
        resizeProfileName(name) {
            return name.length > 16
                ? name.split(' ')[0] +
                      '...' +
                      name
                          .split(' ')
                          .slice(-1)
                          .join(' ')
                : name;
        }
    }
};
</script>