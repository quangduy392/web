import moment from 'moment-timezone';

export const formatDatetime = value => {
    if (!value) return '';
    return moment(value).format('DD/MM/YYYY HH:mm');
};

export const formatDatetimeFull = value => {
    if (!value) return '';
    return moment(value).format('DD/MM/YYYY HH:mm:ss');
};

export const formatDate = value => {
    if (!value) return '';
    return moment(value).format('DD/MM/YYYY');
};

export const format12Hours = value => {
    if (!value) return '';
    return moment(value).format('hh:mm A');
};

export const formatServerTime = (value, inputFormat) => {
    if (!value) return '';
    return moment(value, inputFormat)
        .utc()
        .format();
};
