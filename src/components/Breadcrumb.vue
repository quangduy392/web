<template>
    <ol class="breadcrumb">
        <li class="breadcrumb-item" v-for="(item, index) in list" :key="index">
            <span class="active" v-if="isLast(index)">{{ showName(index) }}</span>
            <router-link :to="item" v-else>
                <i class="fa fa-home" aria-hidden="true" v-if="index == 0"></i> {{ showName(index) }}
            </router-link>
        </li>
    </ol>
</template>

<script>
export default {
    props: {
        list: {
            type: Array,
            required: true,
            default: () => []
        }
    },
    mounted() {
        // get route i18n string
        const routeI18nStrings = [];
        this.list.forEach((route, index) => {
            let route18nString = 'routers.';
            const parentRoutes = this.list.slice(0, index);
            parentRoutes.forEach(parentRoute => {
                route18nString += `${parentRoute.name}-children.`;
            });
            route18nString += route.name;
            routeI18nStrings.push(route18nString);
        });
        this.routeI18nStrings = routeI18nStrings;
    },
    data() {
        return {
            routeI18nStrings: []
        };
    },
    methods: {
        isLast(index) {
            return index === this.list.length - 1;
        },
        showName(index) {
            const item = this.list[index];
            if (typeof item === 'string') {
                return item;
            } else {
                return this.$i18n.t(this.routeI18nStrings[index]);
            }
        }
    }
};
</script>
