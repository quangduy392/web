import API_CONFIG from '../api-config';

const getImageProfileUrl = (profileId, imageId) => {
    const apiLink = API_CONFIG.BASE_URL + _.get(API_CONFIG, 'profile.image');
    return apiLink.replace(/:profileId/g, profileId).replace(/:id/g, imageId);
};

export default getImageProfileUrl;
