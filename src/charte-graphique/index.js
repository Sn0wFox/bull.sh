import $ from 'jquery';
import {initMenu, initHeader, initNotifications} from '../commons/common';

let $body = $('body');
let $window = $(window);

initMenu('#menu', $body);
initHeader($('#bull-header'), $('#bull-article-header'), $window);
initNotifications();

$('#notif').on('click', () => $.notify('Well, there you go!', {style: 'bull'}));