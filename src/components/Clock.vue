<template>
    <h4>{{currentDatetime}}</h4>
</template>

<script>
import moment from 'moment-timezone';

export default {
    name: 'clock',
    props: {
        format: {
            type: String,
            default: 'HH:mm:ss - DD/MM/YYYY'
        }
    },
    mounted: function() {
        this.secondClockInterval = setInterval(() => {
            this.currentDatetime = moment().format(this.format);
        }, 1000);
    },
    data: function() {
        return {
            secondClockInterval: null,
            currentDatetime: moment().format(this.format)
        };
    },
    beforeDestroy() {
        if (this.secondClockInterval) {
            clearInterval(this.secondClockInterval);
        }
    }
};
</script>