import $ from 'jquery';
import {initMenu, initHeader} from '../commons/common';

let $body = $('body');
let $window = $(window);

initMenu('#menu', $body);
initHeader('#bull-header', $('#bull-article-header'), $window);