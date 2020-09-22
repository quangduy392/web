<template>
    <div class="app flex-row align-items-center login-main-container">
        <div class="container">
            <b-row class="justify-content-center">
                <b-col md="5" sm="8">
                    <b-card no-body class="p-4" bg-variant="dark">
                        <div class="text-center">
                            <img src="/static/img/logo4.png" class="standalone-logo" />
                        </div>
                        <b-card-body>
                            <form @submit.prevent="login">
                                <b-input-group class="mb-4">
                                    <b-input-group-prepend>
                                        <b-input-group-text>
                                            <i class="icon-user"></i>
                                        </b-input-group-text>
                                    </b-input-group-prepend>
                                    <input
                                        name="email"
                                        v-validate="'required'"
                                        data-vv-as="Email"
                                        class="form-control"
                                        placeholder="Email"
                                        v-model="email"
                                    />
                                    <div
                                        v-show="errors.has('email')"
                                        class="validation-message text-danger"
                                    >
                                        {{ errors.first('email') }}
                                    </div>
                                </b-input-group>
                                <b-input-group class="mb-4">
                                    <b-input-group-prepend>
                                        <b-input-group-text>
                                            <i class="icon-lock"></i>
                                        </b-input-group-text>
                                    </b-input-group-prepend>
                                    <input
                                        type="password"
                                        class="form-control"
                                        :placeholder="$t('loginPage.password')"
                                        v-model="password"
                                        name="password"
                                        v-validate="'required'"
                                        :data-vv-as="$t('loginPage.password')"
                                    />
                                    <div
                                        v-show="errors.has('password')"
                                        class="validation-message text-danger"
                                    >
                                        {{ errors.first('password') }}
                                    </div>
                                </b-input-group>
                                <div>
                                    <b-button v-if="this.$root.sso.url.length"
                                        variant="warning"
                                        class="px-4"
                                        @click="goToSSOLoginPage"
                                    >
                                        {{
                                        $t('loginPage.ssoLogin')
                                        }}
                                    </b-button>
                                    <b-button
                                        type="submit"
                                        variant="primary"
                                        class="px-4 float-right"
                                    >
                                        {{ $t('loginPage.login') }}
                                    </b-button>
                                </div>
                            </form>
                        </b-card-body>
                    </b-card>
                </b-col>
            </b-row>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import CONSTANTS from '@/constants';

export default {
    name: 'Login',
    data() {
        return {
            email: '',
            password: ''
        };
    },
    methods: {
        ...mapActions({
            actionLogin: 'auth/actionLogin',
            ssoLogin: 'auth/ssoLogin',
            ssoLoginV2: 'auth/ssoLoginV2',
            getCurrentUserDetail: 'auth/getCurrentUserDetail'
        }),
        login: function() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    const { email, password } = this;
                    this.actionLogin({ email, password })
                        .then(async () => {
                            await this.getCurrentUserDetail();
                            this.$router.push('/home');
                            this.$toaster.success(this.$t('loginPage.loginSuccessMsg'));
                        })
                        .catch(() => {
                            this.$toaster.error(this.$t('loginPage.loginErrorMsg'));
                        });
                }
            });
        },
        goToSSOLoginPage() {
            location.href = this.$root.sso.url;
        }
    },
    mounted() {
        const code = this.$route.query.code;
        if (code) {
            const body = {
                code: code,
                grantType: 'authorization_code',
                redirectUri: window.location.origin.concat('/#/login')
            };
            this.ssoLoginV2(body)
                .then(async () => {
                    await this.getCurrentUserDetail();
                    this.$router.push('/home');
                    this.$toaster.success(this.$t('loginPage.loginSuccessMsg'));
                })
                .catch(() => {
                    this.$toaster.error(this.$t('loginPage.loginErrorMsg'));
                });
        }
        const ssoToken = this.$cookies.get(CONSTANTS.SSO_COOKIE_TOKEN_NAME);
        if (ssoToken) {
            this.ssoLogin({ token: ssoToken })
                .then(async () => {
                    await this.getCurrentUserDetail();
                    this.$router.push('/home');
                    this.$toaster.success(this.$t('loginPage.loginSuccessMsg'));
                })
                .catch(() => {
                    this.$toaster.error(this.$t('loginPage.loginErrorMsg'));
                });
        }
    }
};
</script>
