import API_CONFIG from '../api-config';

const getAlertEventImageUrl = (id, type) => {
    const apiLink = API_CONFIG.BASE_URL + _.get(API_CONFIG, 'event.imageWithType');
    return apiLink.replace(/:id/g, id).replace(/:type/g, type);
};

export default getAlertEventImageUrl;
