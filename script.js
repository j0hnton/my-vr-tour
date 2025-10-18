(function(){
    var script = {
 "scripts": {
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; if(audio){ delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "playGlobalAudio": function(audio, endCallback){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = audio; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext); }; playNext(); },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "keepComponentVisibility": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')]; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } return this.playGlobalAudio(audio, endCallback); },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "setOverlayBehaviour": function(overlay, media, action){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 2000); }; if(window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "registerKey": function(key, value){  window[key] = value; },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; } if(audio.get('state') == 'playing') audio.pause(); },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "getPlayListWithMedia": function(media, onlySelected){  var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) return playList; } return undefined; },
  "shareWhatsapp": function(url){  window.open('https://api.whatsapp.com/send/?text=' + encodeURIComponent(url), '_blank'); },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "shareFacebook": function(url){  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank'); },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "getKey": function(key){  return window[key]; },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')]; } return audio; },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "unregisterKey": function(key){  delete window[key]; },
  "existsKey": function(key){  return key in window; },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "shareTwitter": function(url){  window.open('https://twitter.com/intent/tweet?source=webclient&url=' + url, '_blank'); },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios)); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; var mediaDispatcherByParam = mediaDispatcher != undefined; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = mediaDispatcher ? this.getPlayListWithMedia(mediaDispatcher, true) : undefined; if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } if(player != itemDispatcher.get('player') || !mediaDispatcherByParam){ item.bind('begin', onBeginFunction, self); } this.executeFunctionWhenChange(playList, index, disposeCallback); },
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } }
 },
 "children": [
  "this.MainViewer",
  "this.Container_0C5F33A8_3BA0_A6FF_41C3_2A6652E2CE94",
  "this.Container_1B9AAD00_16C4_0505_41B5_6F4AE0747E48",
  "this.Container_0A760F11_3BA1_BFAE_41CD_32268FCAF8B4",
  "this.Container_1B99BD00_16C4_0505_41A4_A3C2452B0288",
  "this.Container_062AB830_1140_E215_41AF_6C9D65345420",
  "this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15",
  "this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7",
  "this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41",
  "this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E",
  "this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC"
 ],
 "id": "rootPlayer",
 "buttonToggleFullscreen": "this.Button_4CF1FD24_5A86_3DF2_41B3_7CDBA2E3D44A",
 "backgroundPreloadEnabled": true,
 "defaultVRPointer": "laser",
 "start": "this.init(); this.visibleComponentsIfPlayerFlagEnabled([this.Button_485BFF41_598E_3DB2_41A9_33F36E014467], 'gyroscopeAvailable'); this.syncPlaylists([this.DropDown_0561BA16_3AA3_A1D2_41C7_FDA0B6E9EE29_playlist,this.DropDown_05789A1B_3AA3_A1D2_41CC_002739F0C312_playlist,this.DropDown_05783A1F_3AA3_A1D2_41A6_E88282E5373B_playlist,this.DropDown_057BFA20_3AA3_A1EE_41A9_8EE569D894A7_playlist,this.DropDown_057B3A27_3AA3_A1F2_41C0_6BB995D79A09_playlist,this.DropDown_05784A29_3AA3_A1FE_41B1_E2305F2F53BE_playlist,this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist,this.mainPlayList]); if(!this.get('fullscreenAvailable')) { [this.Button_4CF1FD24_5A86_3DF2_41B3_7CDBA2E3D44A].forEach(function(component) { component.set('visible', false); }) }",
 "paddingLeft": 0,
 "borderSize": 0,
 "downloadEnabled": true,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 20,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "propagateClick": true,
 "horizontalAlign": "left",
 "minWidth": 20,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "desktopMipmappingEnabled": false,
 "height": "100%",
 "definitions": [{
 "items": [
  {
   "media": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F",
   "camera": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.DropDown_05783A1F_3AA3_A1D2_41A6_E88282E5373B_playlist, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89",
   "camera": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.DropDown_05783A1F_3AA3_A1D2_41A6_E88282E5373B_playlist, 1, 0)",
   "player": "this.MainViewerPanoramaPlayer"
  }
 ],
 "id": "DropDown_05783A1F_3AA3_A1D2_41A6_E88282E5373B_playlist",
 "class": "PlayList"
},
{
 "items": [
  {
   "media": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F",
   "camera": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.DropDown_05784A29_3AA3_A1FE_41B1_E2305F2F53BE_playlist, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89",
   "camera": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.DropDown_05784A29_3AA3_A1FE_41B1_E2305F2F53BE_playlist, 1, 0)",
   "player": "this.MainViewerPanoramaPlayer"
  }
 ],
 "id": "DropDown_05784A29_3AA3_A1FE_41B1_E2305F2F53BE_playlist",
 "class": "PlayList"
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "mouseControlMode": "drag_acceleration",
 "buttonCardboardView": "this.Button_4D1C404A_5A87_C3B6_41BC_63B811C40CD0",
 "buttonToggleGyroscope": "this.Button_485BFF41_598E_3DB2_41A9_33F36E014467",
 "viewerArea": "this.MainViewer",
 "class": "PanoramaPlayer",
 "buttonToggleHotspots": "this.Button_4DE935B8_5A86_4CD2_41A9_D487E3DF3FBA",
 "touchControlMode": "drag_rotation",
 "id": "MainViewerPanoramaPlayer",
 "displayPlaybackBar": true,
 "gyroscopeVerticalDraggingEnabled": true
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 63.61,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_E86570F3_F974_CDF3_41EC_29398924FDA4",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "items": [
  {
   "media": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F",
   "camera": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.DropDown_05789A1B_3AA3_A1D2_41CC_002739F0C312_playlist, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89",
   "camera": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.DropDown_05789A1B_3AA3_A1D2_41CC_002739F0C312_playlist, 1, 0)",
   "player": "this.MainViewerPanoramaPlayer"
  }
 ],
 "id": "DropDown_05789A1B_3AA3_A1D2_41CC_002739F0C312_playlist",
 "class": "PlayList"
},
{
 "items": [
  {
   "media": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F",
   "camera": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.DropDown_057B3A27_3AA3_A1F2_41C0_6BB995D79A09_playlist, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89",
   "camera": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.DropDown_057B3A27_3AA3_A1F2_41C0_6BB995D79A09_playlist, 1, 0)",
   "player": "this.MainViewerPanoramaPlayer"
  }
 ],
 "id": "DropDown_057B3A27_3AA3_A1F2_41C0_6BB995D79A09_playlist",
 "class": "PlayList"
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "items": [
  {
   "media": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F",
   "camera": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89",
   "camera": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist, 1, 0)",
   "player": "this.MainViewerPanoramaPlayer"
  }
 ],
 "id": "ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist",
 "class": "PlayList"
},
{
 "items": [
  {
   "media": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F",
   "camera": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.DropDown_057BFA20_3AA3_A1EE_41A9_8EE569D894A7_playlist, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89",
   "camera": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.DropDown_057BFA20_3AA3_A1EE_41A9_8EE569D894A7_playlist, 1, 0)",
   "player": "this.MainViewerPanoramaPlayer"
  }
 ],
 "id": "DropDown_057BFA20_3AA3_A1EE_41A9_8EE569D894A7_playlist",
 "class": "PlayList"
},
{
 "hfovMin": "150%",
 "hfov": 360,
 "label": "test4",
 "id": "panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89",
 "thumbnailUrl": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_t.jpg",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F",
   "yaw": -0.76,
   "distance": 1,
   "backwardYaw": -116.39,
   "class": "AdjacentPanorama"
  }
 ],
 "vfov": 180,
 "class": "Panorama",
 "overlays": [
  "this.overlay_F63579EE_F94C_BC14_41D5_74B26A47934A"
 ],
 "partial": false
},
{
 "hfovMin": "150%",
 "hfov": 360,
 "label": "test5",
 "id": "panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F",
 "thumbnailUrl": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_t.jpg",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/f/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/f/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/f/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/u/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/u/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/u/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/r/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/r/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/r/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame",
   "back": {
    "levels": [
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/b/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/b/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/b/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/d/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/d/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/d/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/l/0/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/l/1/{row}_{column}.jpg",
      "tags": "ondemand",
      "class": "TiledImageResourceLevel",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_0/l/2/{row}_{column}.jpg",
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel",
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89",
   "yaw": -116.39,
   "distance": 1,
   "backwardYaw": -0.76,
   "class": "AdjacentPanorama"
  }
 ],
 "vfov": 180,
 "class": "Panorama",
 "overlays": [
  "this.overlay_F7990A22_F94C_7C0D_41E9_6BA716D5D4A4"
 ],
 "partial": false
},
{
 "items": [
  {
   "media": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F",
   "camera": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89",
   "camera": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 1, 0)",
   "player": "this.MainViewerPanoramaPlayer",
   "end": "this.trigger('tourEnded')"
  }
 ],
 "id": "mainPlayList",
 "class": "PlayList"
},
{
 "automaticZoomSpeed": 10,
 "class": "PanoramaCamera",
 "initialPosition": {
  "yaw": 179.24,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "id": "camera_E99E80D3_F974_CC33_41E9_FB03064892C1",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_in",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 323,
    "easing": "linear",
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "yawSpeed": 7.96,
    "yawDelta": 18.5,
    "easing": "cubic_out",
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "items": [
  {
   "media": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F",
   "camera": "this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.DropDown_0561BA16_3AA3_A1D2_41C7_FDA0B6E9EE29_playlist, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89",
   "camera": "this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_camera",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.DropDown_0561BA16_3AA3_A1D2_41C7_FDA0B6E9EE29_playlist, 1, 0)",
   "player": "this.MainViewerPanoramaPlayer"
  }
 ],
 "id": "DropDown_0561BA16_3AA3_A1D2_41C7_FDA0B6E9EE29_playlist",
 "class": "PlayList"
},
{
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "id": "MainViewer",
 "left": 0,
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderSize": 0,
 "paddingLeft": 0,
 "progressBarBorderRadius": 0,
 "playbackBarHeadShadowVerticalLength": 0,
 "width": "100%",
 "playbackBarBorderRadius": 0,
 "toolTipShadowOpacity": 0,
 "minHeight": 50,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "playbackBarHeadBorderColor": "#000000",
 "toolTipFontFamily": "Georgia",
 "progressLeft": 0,
 "paddingRight": 0,
 "propagateClick": true,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadBorderRadius": 0,
 "height": "100%",
 "minWidth": 100,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadShadowHorizontalLength": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "toolTipFontColor": "#FFFFFF",
 "toolTipBackgroundColor": "#000000",
 "progressBarBackgroundColorDirection": "vertical",
 "progressOpacity": 1,
 "vrPointerSelectionTime": 2000,
 "progressHeight": 10,
 "playbackBarHeadShadow": true,
 "progressBottom": 0,
 "shadow": false,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "vrPointerColor": "#FFFFFF",
 "toolTipPaddingRight": 10,
 "toolTipBorderSize": 1,
 "progressBarOpacity": 1,
 "borderSize": 0,
 "toolTipPaddingTop": 7,
 "toolTipDisplayTime": 600,
 "toolTipPaddingLeft": 10,
 "progressBorderSize": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderRadius": 0,
 "playbackBarBorderColor": "#FFFFFF",
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "transitionMode": "blending",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorRatios": [
  0.01
 ],
 "playbackBarHeadHeight": 15,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "top": 0,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "transitionDuration": 500,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 5,
 "progressBorderColor": "#FFFFFF",
 "playbackBarLeft": 0,
 "toolTipShadowSpread": 0,
 "toolTipShadowBlurRadius": 3,
 "paddingBottom": 0,
 "toolTipTextShadowColor": "#000000",
 "toolTipOpacity": 0.5,
 "toolTipBorderColor": "#767676",
 "class": "ViewerArea",
 "toolTipFontSize": 13,
 "paddingTop": 0,
 "toolTipPaddingBottom": 7,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowBlurRadius": 3,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Main Viewer"
 },
 "toolTipShadowColor": "#333333",
 "playbackBarHeight": 10,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadWidth": 6
},
{
 "children": [
  "this.Label_0C5F13A8_3BA0_A6FF_41BD_E3D21CFCE151",
  "this.Label_0C5F23A8_3BA0_A6FF_419F_468451E37918"
 ],
 "id": "Container_0C5F33A8_3BA0_A6FF_41C3_2A6652E2CE94",
 "left": 30,
 "width": 271,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "horizontalAlign": "left",
 "minWidth": 1,
 "bottom": 20,
 "scrollBarOpacity": 0.5,
 "height": 97,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "--STICKER"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Label_0E9CEE5D_36F3_E64E_419C_5A94FA5D3CA1",
  "this.Image_05314BAF_3AA1_A6F2_41CB_86A11240FA50",
  "this.Container_0542AAAA_3AA3_A6F3_41B2_0E208ADBBBE1"
 ],
 "id": "Container_1B9AAD00_16C4_0505_41B5_6F4AE0747E48",
 "left": "0%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "height": 60,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": true,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "top": 0,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "--BUTTON SET"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Button_4D1C404A_5A87_C3B6_41BC_63B811C40CD0",
  "this.Button_485BFF41_598E_3DB2_41A9_33F36E014467",
  "this.Button_4C5C0864_5A8E_C472_41C4_7C0748488A41",
  "this.Button_4DE935B8_5A86_4CD2_41A9_D487E3DF3FBA",
  "this.Button_4CF1FD24_5A86_3DF2_41B3_7CDBA2E3D44A"
 ],
 "id": "Container_0A760F11_3BA1_BFAE_41CD_32268FCAF8B4",
 "width": 60,
 "paddingLeft": 0,
 "borderSize": 0,
 "right": 15,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "height": 300,
 "backgroundColorRatios": [
  0.02
 ],
 "propagateClick": false,
 "horizontalAlign": "center",
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "top": 62,
 "gap": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "middle",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "visible": false,
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "-button set"
 },
 "layout": "vertical"
},
{
 "children": [
  "this.IconButton_7B212C50_3AA0_A1AF_41C5_F659ED22BD52",
  "this.IconButton_7B21DC51_3AA0_A251_41B1_CEAABC2475F8",
  "this.IconButton_7B21CC51_3AA0_A251_41C9_1ABF5F74EDA0",
  "this.IconButton_7B21FC51_3AA0_A251_41CC_46CDE74591EA",
  "this.IconButton_7B206C51_3AA0_A251_41A3_B3DB657BC52B",
  "this.IconButton_7B201C51_3AA0_A251_41CD_5CC0A59F2DE8",
  "this.IconButton_7B200C51_3AA0_A251_41CC_7E57609B3C93"
 ],
 "id": "Container_1B99BD00_16C4_0505_41A4_A3C2452B0288",
 "left": "0%",
 "width": "100%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 30,
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "horizontalAlign": "right",
 "minWidth": 1,
 "bottom": "0%",
 "scrollBarOpacity": 0.5,
 "height": 90,
 "gap": 3,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "middle",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "-button set container"
 },
 "layout": "horizontal"
},
{
 "children": [
  "this.Container_062A782F_1140_E20B_41AF_B3E5DE341773",
  "this.Container_062A9830_1140_E215_41A7_5F2BBE5C20E4"
 ],
 "id": "Container_062AB830_1140_E215_41AF_6C9D65345420",
 "left": "0%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, false, 0, null, null, false)",
 "bottom": "0%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "visible": false,
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "---INFO photo"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_39A197B1_0C06_62AF_419A_D15E4DDD2528"
 ],
 "id": "Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15",
 "left": "0%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15, false, 0, null, null, false)",
 "bottom": "0%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "visible": false,
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "---PANORAMA LIST"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_221C1648_0C06_E5FD_4180_8A2E8B66315E",
  "this.Container_221B3648_0C06_E5FD_4199_FCE031AE003B"
 ],
 "id": "Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7",
 "left": "0%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7, false, 0, null, null, false)",
 "bottom": "0%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "visible": false,
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "---LOCATION"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_2F8A6686_0D4F_6B71_4174_A02FE43588D3"
 ],
 "id": "Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41",
 "left": "0%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41, false, 0, null, null, false)",
 "bottom": "0%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "visible": false,
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "---FLOORPLAN"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_2A193C4C_0D3B_DFF0_4161_A2CD128EF536"
 ],
 "id": "Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E",
 "left": "0%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E, false, 0, null, null, false)",
 "bottom": "0%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "visible": false,
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "---PHOTOALBUM"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_06C5DBA5_1140_A63F_41AD_1D83A33F1255",
  "this.Container_06C43BA5_1140_A63F_41A1_96DC8F4CAD2F"
 ],
 "id": "Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC",
 "left": "0%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0.6,
 "scrollBarColor": "#04A3E1",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "click": "this.setComponentVisibility(this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC, false, 0, null, null, false)",
 "bottom": "0%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "visible": false,
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "---REALTOR"
 },
 "layout": "absolute"
},
{
 "fontFamily": "Arial",
 "fontColor": "#FFFFFF",
 "data": {
  "name": "Button Settings Fullscreen"
 },
 "shadowBlurRadius": 6,
 "id": "Button_4CF1FD24_5A86_3DF2_41B3_7CDBA2E3D44A",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "fontStyle": "normal",
 "width": 60,
 "pressedIconWidth": 30,
 "paddingLeft": 0,
 "borderSize": 0,
 "pressedIconHeight": 30,
 "backgroundOpacity": 1,
 "iconHeight": 30,
 "shadowSpread": 1,
 "rollOverBackgroundOpacity": 1,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "pressedRollOverBackgroundColorRatios": [
  0
 ],
 "height": 60,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "mode": "toggle",
 "pressedIconURL": "skin/Button_4CF1FD24_5A86_3DF2_41B3_7CDBA2E3D44A_pressed.png",
 "shadowColor": "#000000",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": 12,
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/Button_4CF1FD24_5A86_3DF2_41B3_7CDBA2E3D44A.png",
 "class": "Button",
 "iconWidth": 30,
 "backgroundColorDirection": "vertical",
 "fontWeight": "normal",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "pressedRollOverBackgroundColor": [
  "#CE6700"
 ],
 "layout": "horizontal"
},
{
 "fontFamily": "Arial",
 "fontColor": "#FFFFFF",
 "data": {
  "name": "Button Settings Mute"
 },
 "shadowBlurRadius": 6,
 "id": "Button_4C5C0864_5A8E_C472_41C4_7C0748488A41",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "fontStyle": "normal",
 "width": 60,
 "pressedIconWidth": 30,
 "paddingLeft": 0,
 "borderSize": 0,
 "pressedIconHeight": 30,
 "backgroundOpacity": 1,
 "iconHeight": 30,
 "shadowSpread": 1,
 "rollOverBackgroundOpacity": 1,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "pressedRollOverBackgroundColorRatios": [
  0
 ],
 "height": 60,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "mode": "toggle",
 "pressedIconURL": "skin/Button_4C5C0864_5A8E_C472_41C4_7C0748488A41_pressed.png",
 "shadowColor": "#000000",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": 12,
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/Button_4C5C0864_5A8E_C472_41C4_7C0748488A41.png",
 "class": "Button",
 "iconWidth": 30,
 "backgroundColorDirection": "vertical",
 "fontWeight": "normal",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "pressedRollOverBackgroundColor": [
  "#CE6700"
 ],
 "layout": "horizontal"
},
{
 "fontFamily": "Arial",
 "fontColor": "#FFFFFF",
 "shadowBlurRadius": 6,
 "id": "Button_4D1C404A_5A87_C3B6_41BC_63B811C40CD0",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "fontStyle": "normal",
 "width": 60,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "iconHeight": 30,
 "shadowSpread": 1,
 "rollOverBackgroundOpacity": 1,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "height": 60,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "mode": "push",
 "pressedIconURL": "skin/Button_4D1C404A_5A87_C3B6_41BC_63B811C40CD0_pressed.png",
 "shadowColor": "#000000",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": 12,
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/Button_4D1C404A_5A87_C3B6_41BC_63B811C40CD0.png",
 "class": "Button",
 "iconWidth": 30,
 "backgroundColorDirection": "vertical",
 "fontWeight": "normal",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "Button settings VR"
 },
 "layout": "horizontal"
},
{
 "fontFamily": "Arial",
 "fontColor": "#FFFFFF",
 "data": {
  "name": "Button Settings Gyro"
 },
 "rollOverIconHeight": 30,
 "shadowBlurRadius": 6,
 "id": "Button_485BFF41_598E_3DB2_41A9_33F36E014467",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "fontStyle": "normal",
 "width": 60,
 "pressedIconWidth": 30,
 "paddingLeft": 0,
 "borderSize": 0,
 "pressedIconHeight": 30,
 "backgroundOpacity": 1,
 "iconHeight": 30,
 "shadowSpread": 1,
 "rollOverBackgroundOpacity": 1,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "pressedRollOverBackgroundColorRatios": [
  0
 ],
 "height": 60,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "mode": "toggle",
 "rollOverIconWidth": 30,
 "shadowColor": "#000000",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": 12,
 "paddingBottom": 0,
 "pressedIconURL": "skin/Button_485BFF41_598E_3DB2_41A9_33F36E014467_pressed.png",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/Button_485BFF41_598E_3DB2_41A9_33F36E014467.png",
 "class": "Button",
 "iconWidth": 30,
 "backgroundColorDirection": "vertical",
 "fontWeight": "normal",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "pressedRollOverBackgroundColor": [
  "#CE6700"
 ],
 "layout": "horizontal"
},
{
 "fontFamily": "Arial",
 "fontColor": "#FFFFFF",
 "data": {
  "name": "Button Settings HS"
 },
 "rollOverIconHeight": 30,
 "shadowBlurRadius": 6,
 "id": "Button_4DE935B8_5A86_4CD2_41A9_D487E3DF3FBA",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "fontStyle": "normal",
 "width": 60,
 "pressedIconWidth": 30,
 "paddingLeft": 0,
 "borderSize": 0,
 "pressedIconHeight": 30,
 "backgroundOpacity": 1,
 "iconHeight": 30,
 "shadowSpread": 1,
 "rollOverBackgroundOpacity": 1,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "pressedRollOverBackgroundColorRatios": [
  0
 ],
 "height": 60,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "mode": "toggle",
 "rollOverIconWidth": 30,
 "pressedIconURL": "skin/Button_4DE935B8_5A86_4CD2_41A9_D487E3DF3FBA_pressed.png",
 "shadowColor": "#000000",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": 12,
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/Button_4DE935B8_5A86_4CD2_41A9_D487E3DF3FBA.png",
 "class": "Button",
 "iconWidth": 30,
 "backgroundColorDirection": "vertical",
 "fontWeight": "normal",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "pressedRollOverBackgroundColor": [
  "#CE6700"
 ],
 "layout": "horizontal"
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F, this.camera_E86570F3_F974_CDF3_41EC_29398924FDA4); this.mainPlayList.set('selectedIndex', 0)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Arrow 06c Left-Up"
 },
 "maps": [
  {
   "hfov": 24.9,
   "yaw": -0.76,
   "image": {
    "levels": [
     {
      "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_1_HS_0_0_0_map.gif",
      "width": 41,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 32.59,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "hfov": 24.9,
   "image": "this.AnimatedImageResource_EBCCCBFB_F94B_B3FC_41CD_AD62FA5480CC",
   "pitch": 32.59,
   "yaw": -0.76,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 50
  }
 ],
 "id": "overlay_F63579EE_F94C_BC14_41D5_74B26A47934A",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89, this.camera_E99E80D3_F974_CC33_41E9_FB03064892C1); this.mainPlayList.set('selectedIndex', 1)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Circle 03c"
 },
 "maps": [
  {
   "hfov": 16.55,
   "yaw": -116.39,
   "image": {
    "levels": [
     {
      "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_1_HS_0_0_0_map.gif",
      "width": 61,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 67.83,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "hfov": 16.55,
   "image": "this.AnimatedImageResource_EBCD4BF5_F94B_B3F4_417C_2F9CD3A87CE0",
   "pitch": 67.83,
   "yaw": -116.39,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_F7990A22_F94C_7C0D_41E9_6BA716D5D4A4",
 "rollOverDisplay": false
},
{
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "id": "Label_0C5F13A8_3BA0_A6FF_41BD_E3D21CFCE151",
 "left": 0,
 "textShadowBlurRadius": 10,
 "width": 239,
 "verticalAlign": "top",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "textShadowColor": "#000000",
 "text": "LOREM",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "propagateClick": false,
 "horizontalAlign": "left",
 "height": 67,
 "top": 5,
 "minWidth": 1,
 "textShadowOpacity": 1,
 "textShadowHorizontalLength": 0,
 "fontSize": 54,
 "paddingBottom": 0,
 "fontStyle": "normal",
 "paddingTop": 0,
 "class": "Label",
 "textShadowVerticalLength": 0,
 "textDecoration": "none",
 "fontWeight": "bold",
 "shadow": false,
 "data": {
  "name": "text 1"
 }
},
{
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "id": "Label_0C5F23A8_3BA0_A6FF_419F_468451E37918",
 "left": 0,
 "textShadowBlurRadius": 10,
 "width": 236,
 "verticalAlign": "top",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "textShadowColor": "#000000",
 "text": "DOLOR SIT AMET",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "propagateClick": false,
 "horizontalAlign": "left",
 "height": 32,
 "top": 66,
 "minWidth": 1,
 "textShadowOpacity": 1,
 "textShadowHorizontalLength": 0,
 "fontSize": 18,
 "paddingBottom": 0,
 "fontStyle": "normal",
 "paddingTop": 0,
 "class": "Label",
 "textShadowVerticalLength": 0,
 "textDecoration": "none",
 "fontWeight": "normal",
 "shadow": false,
 "data": {
  "name": "text 2"
 }
},
{
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "id": "Label_0E9CEE5D_36F3_E64E_419C_5A94FA5D3CA1",
 "left": 76,
 "width": 450,
 "verticalAlign": "middle",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "text": "COMPANY NAME",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "propagateClick": false,
 "horizontalAlign": "left",
 "height": 60,
 "top": "0%",
 "minWidth": 1,
 "fontSize": 31,
 "paddingBottom": 0,
 "fontStyle": "normal",
 "paddingTop": 0,
 "class": "Label",
 "textDecoration": "none",
 "fontWeight": "normal",
 "shadow": false,
 "data": {
  "name": "Label Company Name"
 }
},
{
 "maxWidth": 40,
 "id": "Image_05314BAF_3AA1_A6F2_41CB_86A11240FA50",
 "left": 30,
 "maxHeight": 30,
 "width": "4.222%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "url": "skin/Image_05314BAF_3AA1_A6F2_41CB_86A11240FA50.png",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": "0%",
 "propagateClick": false,
 "horizontalAlign": "center",
 "minWidth": 1,
 "bottom": "0%",
 "paddingBottom": 0,
 "verticalAlign": "middle",
 "paddingTop": 0,
 "class": "Image",
 "scaleMode": "fit_inside",
 "shadow": false,
 "data": {
  "name": "logo"
 }
},
{
 "children": [
  "this.DropDown_0561BA16_3AA3_A1D2_41C7_FDA0B6E9EE29",
  "this.DropDown_05789A1B_3AA3_A1D2_41CC_002739F0C312",
  "this.DropDown_05783A1F_3AA3_A1D2_41A6_E88282E5373B",
  "this.DropDown_057BFA20_3AA3_A1EE_41A9_8EE569D894A7",
  "this.DropDown_057B3A27_3AA3_A1F2_41C0_6BB995D79A09",
  "this.DropDown_05784A29_3AA3_A1FE_41B1_E2305F2F53BE",
  "this.Button_4CC5476E_5ABB_CC4E_41D1_A04ABE17DA89"
 ],
 "id": "Container_0542AAAA_3AA3_A6F3_41B2_0E208ADBBBE1",
 "width": 1199,
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 15,
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "horizontalAlign": "right",
 "top": "0%",
 "minWidth": 1,
 "scrollBarOpacity": 0.5,
 "height": 60,
 "gap": 3,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "middle",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "-button set container"
 },
 "layout": "horizontal"
},
{
 "maxWidth": 101,
 "id": "IconButton_7B212C50_3AA0_A1AF_41C5_F659ED22BD52",
 "maxHeight": 101,
 "width": 44,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "transparencyActive": true,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": 44,
 "rollOverIconURL": "skin/IconButton_7B212C50_3AA0_A1AF_41C5_F659ED22BD52_rollover.png",
 "minWidth": 1,
 "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, true, 0, null, null, false)",
 "mode": "push",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_7B212C50_3AA0_A1AF_41C5_F659ED22BD52.png",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton Info"
 }
},
{
 "maxWidth": 101,
 "id": "IconButton_7B21DC51_3AA0_A251_41B1_CEAABC2475F8",
 "maxHeight": 101,
 "width": 44,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "transparencyActive": true,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": 44,
 "rollOverIconURL": "skin/IconButton_7B21DC51_3AA0_A251_41B1_CEAABC2475F8_rollover.png",
 "minWidth": 1,
 "click": "this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15, true, 0, null, null, false)",
 "mode": "push",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_7B21DC51_3AA0_A251_41B1_CEAABC2475F8.png",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton Thumblist"
 }
},
{
 "maxWidth": 101,
 "id": "IconButton_7B21CC51_3AA0_A251_41C9_1ABF5F74EDA0",
 "maxHeight": 101,
 "width": 44,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "transparencyActive": true,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": 44,
 "rollOverIconURL": "skin/IconButton_7B21CC51_3AA0_A251_41C9_1ABF5F74EDA0_rollover.png",
 "minWidth": 1,
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7, true, 0, null, null, false)",
 "mode": "push",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_7B21CC51_3AA0_A251_41C9_1ABF5F74EDA0.png",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton Location"
 }
},
{
 "maxWidth": 101,
 "id": "IconButton_7B21FC51_3AA0_A251_41CC_46CDE74591EA",
 "maxHeight": 101,
 "width": 44,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "transparencyActive": true,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": 44,
 "rollOverIconURL": "skin/IconButton_7B21FC51_3AA0_A251_41CC_46CDE74591EA_rollover.png",
 "minWidth": 1,
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E, true, 0, null, null, false)",
 "mode": "push",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_7B21FC51_3AA0_A251_41CC_46CDE74591EA.png",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton Photoalbum"
 }
},
{
 "maxWidth": 101,
 "id": "IconButton_7B206C51_3AA0_A251_41A3_B3DB657BC52B",
 "maxHeight": 101,
 "width": 44,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "transparencyActive": true,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": 44,
 "rollOverIconURL": "skin/IconButton_7B206C51_3AA0_A251_41A3_B3DB657BC52B_rollover.png",
 "minWidth": 1,
 "click": "this.setComponentVisibility(this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41, true, 0, null, null, false)",
 "mode": "push",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_7B206C51_3AA0_A251_41A3_B3DB657BC52B.png",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton Floorplan"
 }
},
{
 "maxWidth": 101,
 "id": "IconButton_7B201C51_3AA0_A251_41CD_5CC0A59F2DE8",
 "maxHeight": 101,
 "width": 44,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "transparencyActive": true,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": 44,
 "rollOverIconURL": "skin/IconButton_7B201C51_3AA0_A251_41CD_5CC0A59F2DE8_rollover.png",
 "minWidth": 1,
 "pressedIconURL": "skin/IconButton_7B201C51_3AA0_A251_41CD_5CC0A59F2DE8_pressed.png",
 "mode": "push",
 "click": "this.setComponentVisibility(this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC, true, 0, null, null, false)",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_7B201C51_3AA0_A251_41CD_5CC0A59F2DE8.png",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton Realtor"
 }
},
{
 "maxWidth": 101,
 "id": "IconButton_7B200C51_3AA0_A251_41CC_7E57609B3C93",
 "maxHeight": 101,
 "width": 44,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "transparencyActive": true,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": 44,
 "rollOverIconURL": "skin/IconButton_7B200C51_3AA0_A251_41CC_7E57609B3C93_rollover.png",
 "minWidth": 1,
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "mode": "push",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_7B200C51_3AA0_A251_41CC_7E57609B3C93.png",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton Video"
 }
},
{
 "children": [
  "this.Container_062A682F_1140_E20B_41B0_3071FCBF3DC9",
  "this.Container_26D3A42C_3F86_BA30_419B_2C6BE84D2718",
  "this.Container_062A082F_1140_E20A_4193_DF1A4391DC79"
 ],
 "shadowBlurRadius": 25,
 "shadowSpread": 1,
 "left": "15%",
 "right": "15%",
 "shadowColor": "#000000",
 "id": "Container_062A782F_1140_E20B_41AF_B3E5DE341773",
 "backgroundOpacity": 1,
 "paddingLeft": 0,
 "borderSize": 0,
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "10%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "bottom": "10%",
 "scrollBarOpacity": 0.5,
 "gap": 0,
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": true,
 "shadowHorizontalLength": 0,
 "contentOpaque": false,
 "data": {
  "name": "Global"
 },
 "layout": "horizontal"
},
{
 "verticalAlign": "top",
 "children": [
  "this.IconButton_062A8830_1140_E215_419D_3439F16CCB3E"
 ],
 "id": "Container_062A9830_1140_E215_41A7_5F2BBE5C20E4",
 "left": "15%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "15%",
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "scrollBarColor": "#000000",
 "paddingRight": 20,
 "top": "10%",
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "minWidth": 1,
 "bottom": "80%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "horizontalAlign": "right",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container X global"
 },
 "layout": "vertical"
},
{
 "children": [
  "this.Container_3A67552A_0C3A_67BD_4195_ECE46CCB34EA",
  "this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0"
 ],
 "shadowBlurRadius": 25,
 "id": "Container_39A197B1_0C06_62AF_419A_D15E4DDD2528",
 "left": "15%",
 "right": "15%",
 "shadowColor": "#000000",
 "borderSize": 0,
 "backgroundOpacity": 1,
 "paddingLeft": 0,
 "shadowSpread": 1,
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "10%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "center",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "bottom": "10%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": true,
 "shadowHorizontalLength": 0,
 "contentOpaque": false,
 "data": {
  "name": "Global"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.WebFrame_22F9EEFF_0C1A_2293_4165_411D4444EFEA"
 ],
 "shadowBlurRadius": 25,
 "id": "Container_221C1648_0C06_E5FD_4180_8A2E8B66315E",
 "left": "15%",
 "right": "15%",
 "shadowColor": "#000000",
 "borderSize": 0,
 "backgroundOpacity": 1,
 "paddingLeft": 0,
 "shadowSpread": 1,
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "10%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "bottom": "10%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": true,
 "shadowHorizontalLength": 0,
 "contentOpaque": false,
 "data": {
  "name": "Global"
 },
 "layout": "horizontal"
},
{
 "children": [
  "this.IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF"
 ],
 "id": "Container_221B3648_0C06_E5FD_4199_FCE031AE003B",
 "left": "15%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "15%",
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 20,
 "top": "10%",
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "horizontalAlign": "right",
 "minWidth": 1,
 "bottom": "80%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container X global"
 },
 "layout": "vertical"
},
{
 "children": [
  "this.MapViewer",
  "this.Container_2F8A7686_0D4F_6B71_41A9_1A894413085C"
 ],
 "shadowBlurRadius": 25,
 "id": "Container_2F8A6686_0D4F_6B71_4174_A02FE43588D3",
 "left": "15%",
 "right": "15%",
 "shadowColor": "#000000",
 "borderSize": 0,
 "backgroundOpacity": 1,
 "paddingLeft": 0,
 "shadowSpread": 1,
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "10%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "center",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "bottom": "10%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": true,
 "shadowHorizontalLength": 0,
 "contentOpaque": false,
 "data": {
  "name": "Global"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_2A19EC4C_0D3B_DFF0_414D_37145C22C5BC"
 ],
 "shadowBlurRadius": 25,
 "id": "Container_2A193C4C_0D3B_DFF0_4161_A2CD128EF536",
 "left": "15%",
 "right": "15%",
 "shadowColor": "#000000",
 "borderSize": 0,
 "backgroundOpacity": 1,
 "paddingLeft": 0,
 "shadowSpread": 1,
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "10%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "center",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "bottom": "10%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": true,
 "shadowHorizontalLength": 0,
 "contentOpaque": false,
 "data": {
  "name": "Global"
 },
 "layout": "vertical"
},
{
 "children": [
  "this.Container_06C5ABA5_1140_A63F_41A9_850CF958D0DB",
  "this.Container_27875147_3F82_7A70_41CC_C0FFBB32BEFD",
  "this.Container_06C58BA5_1140_A63F_419D_EC83F94F8C54"
 ],
 "shadowBlurRadius": 25,
 "shadowSpread": 1,
 "left": "15%",
 "right": "15%",
 "shadowColor": "#000000",
 "id": "Container_06C5DBA5_1140_A63F_41AD_1D83A33F1255",
 "backgroundOpacity": 1,
 "paddingLeft": 0,
 "borderSize": 0,
 "shadowOpacity": 0.3,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "10%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "bottom": "10%",
 "scrollBarOpacity": 0.5,
 "gap": 0,
 "shadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": true,
 "shadowHorizontalLength": 0,
 "contentOpaque": false,
 "data": {
  "name": "Global"
 },
 "layout": "horizontal"
},
{
 "verticalAlign": "top",
 "children": [
  "this.IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81"
 ],
 "id": "Container_06C43BA5_1140_A63F_41A1_96DC8F4CAD2F",
 "left": "15%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": "15%",
 "backgroundOpacity": 0,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "scrollBarColor": "#000000",
 "paddingRight": 20,
 "top": "10%",
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "minWidth": 1,
 "bottom": "80%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "horizontalAlign": "right",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container X global"
 },
 "layout": "vertical"
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_EBCCCBFB_F94B_B3FC_41CD_AD62FA5480CC",
 "levels": [
  {
   "url": "media/panorama_F2A2B38E_F94C_CC15_41EC_D5D591BD1D89_1_HS_0_0.png",
   "width": 520,
   "height": 300,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_EBCD4BF5_F94B_B3F4_417C_2F9CD3A87CE0",
 "levels": [
  {
   "url": "media/panorama_F23083D0_F94C_4C0D_41CA_8F3EF54DAB9F_1_HS_0_0.png",
   "width": 1080,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "data": {
  "name": "DropDown 1"
 },
 "popUpPaddingLeft": 15,
 "id": "DropDown_0561BA16_3AA3_A1D2_41C7_FDA0B6E9EE29",
 "popUpBorderRadius": 0,
 "width": 116,
 "arrowBeforeLabel": false,
 "rollOverPopUpBackgroundColor": "#CE6700",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "paddingLeft": 15,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "playList": "this.DropDown_0561BA16_3AA3_A1D2_41C7_FDA0B6E9EE29_playlist",
 "popUpShadowColor": "#000000",
 "pressedBackgroundColor": [
  "#CE6700"
 ],
 "popUpGap": 2,
 "minHeight": 1,
 "borderRadius": 0,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "popUpBackgroundColor": "#F7931E",
 "paddingRight": 15,
 "height": 60,
 "pressedBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "selectedPopUpBackgroundColor": "#CE6700",
 "propagateClick": false,
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "popUpBackgroundOpacity": 1,
 "label": "RECEPTION",
 "popUpPaddingBottom": 10,
 "popUpShadow": false,
 "gap": 0,
 "fontSize": 12,
 "paddingBottom": 0,
 "fontStyle": "normal",
 "paddingTop": 0,
 "popUpFontColor": "#FFFFFF",
 "class": "DropDown",
 "arrowColor": "#FFFFFF",
 "popUpPaddingTop": 10,
 "backgroundColorDirection": "vertical",
 "fontWeight": "bold",
 "textDecoration": "none",
 "popUpShadowBlurRadius": 6,
 "popUpShadowSpread": 1,
 "shadow": false,
 "popUpShadowOpacity": 0
},
{
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "data": {
  "name": "DropDown 2"
 },
 "popUpPaddingLeft": 15,
 "id": "DropDown_05789A1B_3AA3_A1D2_41CC_002739F0C312",
 "popUpBorderRadius": 5,
 "width": 96,
 "arrowBeforeLabel": false,
 "rollOverPopUpBackgroundColor": "#CE6700",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "paddingLeft": 15,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "playList": "this.DropDown_05789A1B_3AA3_A1D2_41CC_002739F0C312_playlist",
 "popUpShadowColor": "#000000",
 "pressedBackgroundColor": [
  "#CE6700"
 ],
 "popUpGap": 2,
 "minHeight": 1,
 "borderRadius": 0,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "popUpBackgroundColor": "#F7931E",
 "paddingRight": 15,
 "pressedBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "selectedPopUpBackgroundColor": "#CE6700",
 "propagateClick": false,
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "popUpBackgroundOpacity": 1,
 "popUpPaddingBottom": 10,
 "height": "100%",
 "popUpShadow": false,
 "label": "ROOMS",
 "gap": 0,
 "fontSize": 12,
 "paddingBottom": 0,
 "fontStyle": "normal",
 "paddingTop": 0,
 "popUpFontColor": "#FFFFFF",
 "class": "DropDown",
 "arrowColor": "#FFFFFF",
 "popUpPaddingTop": 10,
 "backgroundColorDirection": "vertical",
 "fontWeight": "bold",
 "textDecoration": "none",
 "popUpShadowBlurRadius": 6,
 "popUpShadowSpread": 1,
 "shadow": false,
 "popUpShadowOpacity": 0
},
{
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "data": {
  "name": "DropDown 3"
 },
 "popUpPaddingLeft": 15,
 "id": "DropDown_05783A1F_3AA3_A1D2_41A6_E88282E5373B",
 "popUpBorderRadius": 0,
 "width": 114,
 "arrowBeforeLabel": false,
 "rollOverPopUpBackgroundColor": "#CE6700",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "paddingLeft": 15,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "playList": "this.DropDown_05783A1F_3AA3_A1D2_41A6_E88282E5373B_playlist",
 "popUpShadowColor": "#000000",
 "pressedBackgroundColor": [
  "#CE6700"
 ],
 "popUpGap": 2,
 "minHeight": 1,
 "borderRadius": 0,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "popUpBackgroundColor": "#F7931E",
 "paddingRight": 15,
 "height": 60,
 "pressedBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "selectedPopUpBackgroundColor": "#CE6700",
 "propagateClick": false,
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "popUpBackgroundOpacity": 1,
 "label": "AMENITIES",
 "popUpPaddingBottom": 10,
 "popUpShadow": false,
 "gap": 0,
 "fontSize": 12,
 "paddingBottom": 0,
 "fontStyle": "normal",
 "paddingTop": 0,
 "popUpFontColor": "#FFFFFF",
 "class": "DropDown",
 "arrowColor": "#FFFFFF",
 "popUpPaddingTop": 10,
 "backgroundColorDirection": "vertical",
 "fontWeight": "bold",
 "textDecoration": "none",
 "popUpShadowBlurRadius": 6,
 "popUpShadowSpread": 1,
 "shadow": false,
 "popUpShadowOpacity": 0
},
{
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "data": {
  "name": "DropDown 4"
 },
 "popUpPaddingLeft": 15,
 "id": "DropDown_057BFA20_3AA3_A1EE_41A9_8EE569D894A7",
 "popUpBorderRadius": 0,
 "width": 130,
 "arrowBeforeLabel": false,
 "rollOverPopUpBackgroundColor": "#CE6700",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "paddingLeft": 15,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "playList": "this.DropDown_057BFA20_3AA3_A1EE_41A9_8EE569D894A7_playlist",
 "popUpShadowColor": "#000000",
 "pressedBackgroundColor": [
  "#CE6700"
 ],
 "popUpGap": 2,
 "minHeight": 1,
 "borderRadius": 0,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "popUpBackgroundColor": "#F7931E",
 "paddingRight": 15,
 "height": 60,
 "pressedBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "selectedPopUpBackgroundColor": "#CE6700",
 "propagateClick": false,
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "popUpBackgroundOpacity": 1,
 "label": "SPORTS AREA",
 "popUpPaddingBottom": 10,
 "popUpShadow": false,
 "gap": 0,
 "fontSize": 12,
 "paddingBottom": 0,
 "fontStyle": "normal",
 "paddingTop": 0,
 "popUpFontColor": "#FFFFFF",
 "class": "DropDown",
 "arrowColor": "#FFFFFF",
 "popUpPaddingTop": 10,
 "backgroundColorDirection": "vertical",
 "fontWeight": "bold",
 "textDecoration": "none",
 "popUpShadowBlurRadius": 6,
 "popUpShadowSpread": 1,
 "shadow": false,
 "popUpShadowOpacity": 0
},
{
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "data": {
  "name": "DropDown 5"
 },
 "popUpPaddingLeft": 15,
 "id": "DropDown_057B3A27_3AA3_A1F2_41C0_6BB995D79A09",
 "popUpBorderRadius": 0,
 "width": 152,
 "arrowBeforeLabel": false,
 "rollOverPopUpBackgroundColor": "#CE6700",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "paddingLeft": 15,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "playList": "this.DropDown_057B3A27_3AA3_A1F2_41C0_6BB995D79A09_playlist",
 "popUpShadowColor": "#000000",
 "pressedBackgroundColor": [
  "#CE6700"
 ],
 "popUpGap": 2,
 "minHeight": 1,
 "borderRadius": 0,
 "rollOverBackgroundColorRatios": [
  0.01
 ],
 "popUpBackgroundColor": "#F7931E",
 "paddingRight": 15,
 "height": 60,
 "pressedBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "selectedPopUpBackgroundColor": "#CE6700",
 "propagateClick": false,
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "popUpBackgroundOpacity": 1,
 "label": "SWIMMING POOL",
 "popUpPaddingBottom": 10,
 "popUpShadow": false,
 "gap": 0,
 "fontSize": 12,
 "paddingBottom": 0,
 "fontStyle": "normal",
 "paddingTop": 0,
 "popUpFontColor": "#FFFFFF",
 "class": "DropDown",
 "arrowColor": "#FFFFFF",
 "popUpPaddingTop": 10,
 "backgroundColorDirection": "vertical",
 "fontWeight": "bold",
 "textDecoration": "none",
 "popUpShadowBlurRadius": 6,
 "popUpShadowSpread": 1,
 "shadow": false,
 "popUpShadowOpacity": 0
},
{
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "data": {
  "name": "DropDown 6"
 },
 "popUpPaddingLeft": 15,
 "id": "DropDown_05784A29_3AA3_A1FE_41B1_E2305F2F53BE",
 "popUpBorderRadius": 0,
 "width": 136,
 "arrowBeforeLabel": false,
 "rollOverPopUpBackgroundColor": "#CE6700",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "paddingLeft": 15,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "playList": "this.DropDown_05784A29_3AA3_A1FE_41B1_E2305F2F53BE_playlist",
 "popUpShadowColor": "#000000",
 "pressedBackgroundColor": [
  "#CE6700"
 ],
 "popUpGap": 2,
 "minHeight": 1,
 "borderRadius": 0,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "popUpBackgroundColor": "#F7931E",
 "paddingRight": 15,
 "height": 60,
 "pressedBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "selectedPopUpBackgroundColor": "#CE6700",
 "propagateClick": false,
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "popUpBackgroundOpacity": 1,
 "label": "RESTAURANTS",
 "popUpPaddingBottom": 10,
 "popUpShadow": false,
 "gap": 0,
 "fontSize": 12,
 "paddingBottom": 0,
 "fontStyle": "normal",
 "paddingTop": 0,
 "popUpFontColor": "#FFFFFF",
 "class": "DropDown",
 "arrowColor": "#FFFFFF",
 "popUpPaddingTop": 10,
 "backgroundColorDirection": "vertical",
 "fontWeight": "bold",
 "textDecoration": "none",
 "popUpShadowBlurRadius": 6,
 "popUpShadowSpread": 1,
 "shadow": false,
 "popUpShadowOpacity": 0
},
{
 "fontFamily": "Arial",
 "fontColor": "#FFFFFF",
 "shadowBlurRadius": 6,
 "id": "Button_4CC5476E_5ABB_CC4E_41D1_A04ABE17DA89",
 "rollOverBackgroundColor": [
  "#CE6700"
 ],
 "fontStyle": "normal",
 "width": 60,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "iconHeight": 17,
 "shadowSpread": 1,
 "rollOverBackgroundOpacity": 1,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "height": 60,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "mode": "toggle",
 "pressedIconURL": "skin/Button_4CC5476E_5ABB_CC4E_41D1_A04ABE17DA89_pressed.png",
 "shadowColor": "#000000",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": 12,
 "paddingBottom": 0,
 "click": "if(!this.Container_0A760F11_3BA1_BFAE_41CD_32268FCAF8B4.get('visible')){ this.setComponentVisibility(this.Container_0A760F11_3BA1_BFAE_41CD_32268FCAF8B4, true, 0, null, null, false) } else { this.setComponentVisibility(this.Container_0A760F11_3BA1_BFAE_41CD_32268FCAF8B4, false, 0, null, null, false) }",
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/Button_4CC5476E_5ABB_CC4E_41D1_A04ABE17DA89.png",
 "class": "Button",
 "iconWidth": 17,
 "backgroundColorDirection": "vertical",
 "fontWeight": "normal",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "Button Settings"
 },
 "layout": "horizontal"
},
{
 "children": [
  "this.Image_062A182F_1140_E20B_41B0_9CB8FFD6AA5A"
 ],
 "id": "Container_062A682F_1140_E20B_41B0_3071FCBF3DC9",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "width": "85%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "horizontalAlign": "center",
 "backgroundColor": [
  "#000000"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "middle",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "-left"
 },
 "layout": "absolute"
},
{
 "id": "Container_26D3A42C_3F86_BA30_419B_2C6BE84D2718",
 "width": 8,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "orange line"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_062A3830_1140_E215_4195_1698933FE51C",
  "this.Container_062A2830_1140_E215_41AA_EB25B7BD381C",
  "this.Container_062AE830_1140_E215_4180_196ED689F4BD"
 ],
 "id": "Container_062A082F_1140_E20A_4193_DF1A4391DC79",
 "paddingLeft": 50,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "scrollBarColor": "#0069A3",
 "width": "50%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 50,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 460,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.51,
 "height": "100%",
 "gap": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 20,
 "verticalAlign": "top",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "-right"
 },
 "layout": "vertical"
},
{
 "maxWidth": 60,
 "id": "IconButton_062A8830_1140_E215_419D_3439F16CCB3E",
 "maxHeight": 60,
 "width": "25%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": "75%",
 "rollOverIconURL": "skin/IconButton_062A8830_1140_E215_419D_3439F16CCB3E_rollover.jpg",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_062A8830_1140_E215_419D_3439F16CCB3E_pressed.jpg",
 "mode": "push",
 "click": "this.setComponentVisibility(this.Container_062AB830_1140_E215_41AF_6C9D65345420, false, 0, null, null, false)",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_062A8830_1140_E215_419D_3439F16CCB3E.jpg",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "X"
 }
},
{
 "children": [
  "this.IconButton_38922473_0C06_2593_4199_C585853A1AB3"
 ],
 "id": "Container_3A67552A_0C3A_67BD_4195_ECE46CCB34EA",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "height": 140,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "header"
 },
 "layout": "absolute"
},
{
 "itemMaxHeight": 1000,
 "itemMaxWidth": 1000,
 "rollOverItemThumbnailShadowColor": "#F7931E",
 "left": 0,
 "itemHorizontalAlign": "center",
 "itemLabelFontFamily": "Montserrat",
 "data": {
  "name": "ThumbnailList"
 },
 "id": "ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0",
 "itemThumbnailOpacity": 1,
 "width": "100%",
 "itemWidth": 220,
 "paddingLeft": 70,
 "selectedItemThumbnailShadow": true,
 "itemBorderRadius": 0,
 "backgroundOpacity": 0,
 "itemLabelGap": 7,
 "itemLabelPosition": "bottom",
 "minHeight": 1,
 "itemThumbnailBorderRadius": 0,
 "horizontalAlign": "center",
 "selectedItemThumbnailShadowBlurRadius": 16,
 "paddingRight": 70,
 "verticalAlign": "middle",
 "height": "92%",
 "itemMinHeight": 50,
 "propagateClick": false,
 "itemPaddingLeft": 3,
 "minWidth": 1,
 "selectedItemThumbnailShadowHorizontalLength": 0,
 "itemPaddingRight": 3,
 "selectedItemLabelFontColor": "#F7931E",
 "scrollBarMargin": 2,
 "itemBackgroundColor": [],
 "scrollBarWidth": 10,
 "itemVerticalAlign": "top",
 "itemPaddingTop": 3,
 "itemBackgroundColorRatios": [],
 "itemMinWidth": 50,
 "itemThumbnailShadow": false,
 "shadow": false,
 "selectedItemLabelFontWeight": "bold",
 "rollOverItemThumbnailShadowBlurRadius": 0,
 "itemLabelTextDecoration": "none",
 "itemHeight": 160,
 "rollOverItemThumbnailShadowVerticalLength": 0,
 "itemLabelFontWeight": "normal",
 "borderSize": 0,
 "rollOverItemThumbnailShadowHorizontalLength": 8,
 "playList": "this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_playlist",
 "scrollBarColor": "#F7931E",
 "itemLabelFontSize": 13,
 "rollOverItemThumbnailShadow": true,
 "itemThumbnailScaleMode": "fit_outside",
 "borderRadius": 5,
 "itemThumbnailHeight": 125,
 "scrollBarOpacity": 0.5,
 "rollOverItemLabelFontColor": "#F7931E",
 "scrollBarVisible": "rollOver",
 "selectedItemThumbnailShadowVerticalLength": 0,
 "bottom": -0.2,
 "itemBackgroundColorDirection": "vertical",
 "itemLabelFontColor": "#666666",
 "gap": 26,
 "paddingBottom": 70,
 "paddingTop": 10,
 "itemThumbnailWidth": 220,
 "itemPaddingBottom": 3,
 "class": "ThumbnailGrid",
 "itemBackgroundOpacity": 0,
 "itemLabelHorizontalAlign": "center",
 "itemMode": "normal",
 "itemOpacity": 1,
 "itemLabelFontStyle": "normal"
},
{
 "scrollEnabled": true,
 "id": "WebFrame_22F9EEFF_0C1A_2293_4165_411D4444EFEA",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14377.55330038866!2d-73.99492968084243!3d40.75084469078082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9f775f259%3A0x999668d0d7c3fd7d!2s400+5th+Ave%2C+New+York%2C+NY+10018!5e0!3m2!1ses!2sus!4v1467271743182\" width=\"600\" height=\"450\" frameborder=\"0\" style=\"border:0\" allowfullscreen>",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "backgroundColor": [
  "#FFFFFF"
 ],
 "minWidth": 1,
 "height": "100%",
 "paddingBottom": 0,
 "paddingTop": 0,
 "insetBorder": false,
 "class": "WebFrame",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "data": {
  "name": "WebFrame48191"
 }
},
{
 "maxWidth": 60,
 "id": "IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF",
 "maxHeight": 60,
 "width": "25%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": "75%",
 "rollOverIconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF_rollover.jpg",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF_pressed.jpg",
 "mode": "push",
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7, false, 0, null, null, false)",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF.jpg",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "X"
 }
},
{
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "id": "MapViewer",
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderSize": 0,
 "paddingLeft": 0,
 "progressBarBorderRadius": 0,
 "playbackBarHeadShadowVerticalLength": 0,
 "width": "100%",
 "playbackBarBorderRadius": 0,
 "toolTipShadowOpacity": 1,
 "minHeight": 1,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "playbackBarHeadBorderColor": "#000000",
 "toolTipFontFamily": "Arial",
 "progressLeft": 0,
 "paddingRight": 0,
 "propagateClick": false,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadBorderRadius": 0,
 "height": "100%",
 "minWidth": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadShadowHorizontalLength": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowHorizontalLength": 0,
 "playbackBarHeadShadowColor": "#000000",
 "progressRight": 0,
 "toolTipShadowVerticalLength": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipFontColor": "#606060",
 "vrPointerSelectionTime": 2000,
 "progressHeight": 10,
 "playbackBarHeadShadow": true,
 "progressBottom": 2,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "shadow": false,
 "playbackBarHeadShadowOpacity": 0.7,
 "vrPointerColor": "#FFFFFF",
 "toolTipPaddingRight": 6,
 "toolTipBorderSize": 1,
 "progressBarOpacity": 1,
 "borderSize": 0,
 "toolTipPaddingTop": 4,
 "toolTipDisplayTime": 600,
 "toolTipPaddingLeft": 6,
 "progressBorderSize": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderRadius": 0,
 "playbackBarBorderColor": "#FFFFFF",
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "transitionMode": "blending",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorRatios": [
  0.01
 ],
 "playbackBarHeadHeight": 15,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "transitionDuration": 500,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "playbackBarLeft": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 0,
 "progressBorderColor": "#FFFFFF",
 "toolTipShadowSpread": 0,
 "toolTipShadowBlurRadius": 3,
 "paddingBottom": 0,
 "toolTipTextShadowColor": "#000000",
 "toolTipOpacity": 1,
 "toolTipBorderColor": "#767676",
 "class": "ViewerArea",
 "toolTipFontSize": 12,
 "paddingTop": 0,
 "toolTipPaddingBottom": 4,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowBlurRadius": 3,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Floor Plan"
 },
 "toolTipShadowColor": "#333333",
 "playbackBarHeight": 10,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadWidth": 6
},
{
 "children": [
  "this.IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E"
 ],
 "id": "Container_2F8A7686_0D4F_6B71_41A9_1A894413085C",
 "width": "100%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "horizontalAlign": "left",
 "height": 140,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "gap": 10,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "scrollBarWidth": 10,
 "paddingTop": 0,
 "class": "Container",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "header"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.ViewerAreaLabeled_2A198C4C_0D3B_DFF0_419F_C9A785406D9C",
  "this.IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482",
  "this.IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510",
  "this.IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1"
 ],
 "id": "Container_2A19EC4C_0D3B_DFF0_414D_37145C22C5BC",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container photo"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Image_06C5BBA5_1140_A63F_41A7_E6D01D4CC397"
 ],
 "id": "Container_06C5ABA5_1140_A63F_41A9_850CF958D0DB",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "width": "55%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "horizontalAlign": "center",
 "backgroundColor": [
  "#000000"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "middle",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "-left"
 },
 "layout": "absolute"
},
{
 "id": "Container_27875147_3F82_7A70_41CC_C0FFBB32BEFD",
 "width": 8,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "orange line"
 },
 "layout": "absolute"
},
{
 "children": [
  "this.Container_06C59BA5_1140_A63F_41B1_4B41E3B7D98D",
  "this.Container_06C46BA5_1140_A63F_4151_B5A20B4EA86A",
  "this.Container_06C42BA5_1140_A63F_4195_037A0687532F"
 ],
 "id": "Container_06C58BA5_1140_A63F_419D_EC83F94F8C54",
 "paddingLeft": 60,
 "borderSize": 0,
 "backgroundOpacity": 1,
 "scrollBarColor": "#0069A3",
 "width": "45%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "paddingRight": 60,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 460,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.51,
 "height": "100%",
 "gap": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 20,
 "verticalAlign": "top",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "-right"
 },
 "layout": "vertical"
},
{
 "maxWidth": 60,
 "id": "IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81",
 "maxHeight": 60,
 "width": "25%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "middle",
 "height": "75%",
 "rollOverIconURL": "skin/IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81_rollover.jpg",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81_pressed.jpg",
 "mode": "push",
 "click": "this.setComponentVisibility(this.Container_06C41BA5_1140_A63F_41AE_B0CBD78DEFDC, false, 0, null, null, false)",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_06C40BA5_1140_A63F_41AC_FA560325FD81.jpg",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "X"
 }
},
{
 "maxWidth": 2000,
 "id": "Image_062A182F_1140_E20B_41B0_9CB8FFD6AA5A",
 "left": "0%",
 "maxHeight": 1000,
 "width": "100%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "url": "skin/Image_062A182F_1140_E20B_41B0_9CB8FFD6AA5A.jpg",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": "0%",
 "propagateClick": false,
 "horizontalAlign": "center",
 "height": "100%",
 "minWidth": 1,
 "paddingBottom": 0,
 "verticalAlign": "middle",
 "paddingTop": 0,
 "class": "Image",
 "scaleMode": "fit_outside",
 "shadow": false,
 "data": {
  "name": "photo"
 }
},
{
 "id": "Container_062A3830_1140_E215_4195_1698933FE51C",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 0,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "height": 60,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "right",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "gap": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "children": [
  "this.HTMLText_062AD830_1140_E215_41B0_321699661E7F",
  "this.Button_062AF830_1140_E215_418D_D2FC11B12C47"
 ],
 "id": "Container_062A2830_1140_E215_41AA_EB25B7BD381C",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#E73B2C",
 "width": "100%",
 "minHeight": 520,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 100,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.79,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 30,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container text"
 },
 "layout": "vertical"
},
{
 "id": "Container_062AE830_1140_E215_4180_196ED689F4BD",
 "width": 370,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "height": 40,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "maxWidth": 60,
 "id": "IconButton_38922473_0C06_2593_4199_C585853A1AB3",
 "maxHeight": 60,
 "width": "100%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": 20,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": 20,
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "top",
 "height": "36.14%",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_38922473_0C06_2593_4199_C585853A1AB3_pressed.jpg",
 "mode": "push",
 "rollOverIconURL": "skin/IconButton_38922473_0C06_2593_4199_C585853A1AB3_rollover.jpg",
 "click": "this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15, false, 0, null, null, false)",
 "paddingBottom": 0,
 "horizontalAlign": "right",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_38922473_0C06_2593_4199_C585853A1AB3.jpg",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton X"
 }
},
{
 "maxWidth": 60,
 "id": "IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E",
 "maxHeight": 60,
 "width": "100%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": 20,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": 20,
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "top",
 "height": "36.14%",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E_pressed.jpg",
 "mode": "push",
 "rollOverIconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E_rollover.jpg",
 "click": "this.setComponentVisibility(this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41, false, 0, null, null, false)",
 "paddingBottom": 0,
 "horizontalAlign": "right",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E.jpg",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton X"
 }
},
{
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "id": "ViewerAreaLabeled_2A198C4C_0D3B_DFF0_419F_C9A785406D9C",
 "left": "0%",
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderSize": 0,
 "paddingLeft": 0,
 "progressBarBorderRadius": 0,
 "playbackBarHeadShadowVerticalLength": 0,
 "width": "100%",
 "playbackBarBorderRadius": 0,
 "toolTipShadowOpacity": 1,
 "minHeight": 1,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "playbackBarHeadBorderColor": "#000000",
 "toolTipFontFamily": "Arial",
 "progressLeft": 0,
 "paddingRight": 0,
 "propagateClick": false,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadBorderRadius": 0,
 "height": "100%",
 "minWidth": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadShadowHorizontalLength": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowHorizontalLength": 0,
 "playbackBarHeadShadowColor": "#000000",
 "progressRight": 0,
 "toolTipShadowVerticalLength": 0,
 "firstTransitionDuration": 0,
 "toolTipFontColor": "#606060",
 "toolTipBackgroundColor": "#F6F6F6",
 "progressBarBackgroundColorDirection": "vertical",
 "progressOpacity": 1,
 "vrPointerSelectionTime": 2000,
 "progressHeight": 10,
 "playbackBarHeadShadow": true,
 "progressBottom": 2,
 "shadow": false,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "vrPointerColor": "#FFFFFF",
 "toolTipPaddingRight": 6,
 "toolTipBorderSize": 1,
 "progressBarOpacity": 1,
 "borderSize": 0,
 "toolTipPaddingTop": 4,
 "toolTipDisplayTime": 600,
 "toolTipPaddingLeft": 6,
 "progressBorderSize": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderRadius": 0,
 "playbackBarBorderColor": "#FFFFFF",
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "transitionMode": "blending",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorRatios": [
  0.01
 ],
 "playbackBarHeadHeight": 15,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "top": "0%",
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "transitionDuration": 500,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 0,
 "progressBorderColor": "#FFFFFF",
 "playbackBarLeft": 0,
 "toolTipShadowSpread": 0,
 "toolTipShadowBlurRadius": 3,
 "paddingBottom": 0,
 "toolTipTextShadowColor": "#000000",
 "toolTipOpacity": 1,
 "toolTipBorderColor": "#767676",
 "class": "ViewerArea",
 "toolTipFontSize": 12,
 "paddingTop": 0,
 "toolTipPaddingBottom": 4,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowBlurRadius": 3,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Viewer photoalbum 1"
 },
 "toolTipShadowColor": "#333333",
 "playbackBarHeight": 10,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadWidth": 6
},
{
 "maxWidth": 60,
 "id": "IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482",
 "left": 10,
 "maxHeight": 60,
 "width": "14.22%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": "20%",
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "middle",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482_pressed.png",
 "bottom": "20%",
 "rollOverIconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482_rollover.png",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "mode": "push",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482.png",
 "class": "IconButton",
 "shadow": false,
 "cursor": "hand",
 "data": {
  "name": "IconButton <"
 }
},
{
 "maxWidth": 60,
 "id": "IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510",
 "maxHeight": 60,
 "width": "14.22%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": 10,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": "20%",
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "middle",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510_pressed.png",
 "bottom": "20%",
 "rollOverIconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510_rollover.png",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "mode": "push",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510.png",
 "class": "IconButton",
 "shadow": false,
 "cursor": "hand",
 "data": {
  "name": "IconButton >"
 }
},
{
 "maxWidth": 60,
 "id": "IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1",
 "maxHeight": 60,
 "width": "10%",
 "paddingLeft": 0,
 "borderSize": 0,
 "right": 20,
 "backgroundOpacity": 0,
 "minHeight": 50,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": 20,
 "transparencyActive": false,
 "propagateClick": false,
 "verticalAlign": "top",
 "height": "10%",
 "minWidth": 50,
 "pressedIconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1_pressed.jpg",
 "mode": "push",
 "rollOverIconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1_rollover.jpg",
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E, false, 0, null, null, false)",
 "paddingBottom": 0,
 "horizontalAlign": "right",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1.jpg",
 "class": "IconButton",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton X"
 }
},
{
 "maxWidth": 2000,
 "id": "Image_06C5BBA5_1140_A63F_41A7_E6D01D4CC397",
 "left": "0%",
 "maxHeight": 1000,
 "width": "100%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "url": "skin/Image_06C5BBA5_1140_A63F_41A7_E6D01D4CC397.jpg",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "top": "0%",
 "propagateClick": false,
 "horizontalAlign": "center",
 "height": "100%",
 "minWidth": 1,
 "paddingBottom": 0,
 "verticalAlign": "bottom",
 "paddingTop": 0,
 "class": "Image",
 "scaleMode": "fit_outside",
 "shadow": false,
 "data": {
  "name": "Image"
 }
},
{
 "id": "Container_06C59BA5_1140_A63F_41B1_4B41E3B7D98D",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 0,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "height": 60,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "right",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "gap": 0,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 20,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "children": [
  "this.HTMLText_0B42C466_11C0_623D_4193_9FAB57A5AC33",
  "this.Container_0D9BF47A_11C0_E215_41A4_A63C8527FF9C"
 ],
 "id": "Container_06C46BA5_1140_A63F_4151_B5A20B4EA86A",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#E73B2C",
 "width": "100%",
 "minHeight": 520,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 100,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.79,
 "height": "100%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 30,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container text"
 },
 "layout": "vertical"
},
{
 "id": "Container_06C42BA5_1140_A63F_4195_037A0687532F",
 "width": 370,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "height": 40,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Container space"
 },
 "layout": "horizontal"
},
{
 "id": "HTMLText_062AD830_1140_E215_41B0_321699661E7F",
 "paddingLeft": 10,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "scrollBarColor": "#F7931E",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 10,
 "propagateClick": false,
 "height": "100%",
 "scrollBarMargin": 2,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "paddingBottom": 20,
 "scrollBarWidth": 10,
 "paddingTop": 0,
 "class": "HTMLText",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#f7931e;font-size:7.61vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.7vh;font-family:'Montserrat';\"><B>LOREM IPSUM</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.7vh;font-family:'Montserrat';\"><B>DOLOR SIT AMET</B></SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.96vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#f7931e;font-size:1.96vh;font-family:'Montserrat';\"><B>CONSECTETUR ADIPISCING ELIT. MORBI BIBENDUM PHARETRA LOREM, ACCUMSAN SAN NULLA.</B></SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.2vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"/></p><p STYLE=\"margin:0; line-height:1.2vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\">Mauris aliquet neque quis libero consequat vestibulum. Donec lacinia consequat dolor viverra sagittis. Praesent consequat porttitor risus, eu condimentum nunc. Proin et velit ac sapien luctus efficitur egestas ac augue. Nunc dictum, augue eget eleifend interdum, quam libero imperdiet lectus, vel scelerisque turpis lectus vel ligula. Duis a porta sem. Maecenas sollicitudin nunc id risus fringilla, a pharetra orci iaculis. Aliquam turpis ligula, tincidunt sit amet consequat ac, imperdiet non dolor.</SPAN></DIV><p STYLE=\"margin:0; line-height:1.2vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\">Integer gravida dui quis euismod placerat. Maecenas quis accumsan ipsum. Aliquam gravida velit at dolor mollis, quis luctus mauris vulputate. Proin condimentum id nunc sed sollicitudin.</SPAN></DIV><p STYLE=\"margin:0; line-height:1.96vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.96vh;font-family:'Montserrat';\"><B>DONEC FEUGIAT:</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.74vh;\"> </SPAN>\u2022 Nisl nec mi sollicitudin facilisis </SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Nam sed faucibus est.</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Ut eget lorem sed leo.</SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Sollicitudin tempor sit amet non urna. </SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"> \u2022 Aliquam feugiat mauris sit amet.</SPAN></DIV><p STYLE=\"margin:0; line-height:1.96vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.96vh;font-family:'Montserrat';\"><B>LOREM IPSUM:</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#f7931e;font-size:2.83vh;font-family:'Oswald';\"><B>$150,000</B></SPAN></SPAN></DIV></div>",
 "shadow": false,
 "data": {
  "name": "HTMLText"
 }
},
{
 "fontFamily": "Montserrat",
 "fontColor": "#FFFFFF",
 "shadowBlurRadius": 6,
 "id": "Button_062AF830_1140_E215_418D_D2FC11B12C47",
 "pressedBackgroundColor": [
  "#000000"
 ],
 "fontStyle": "normal",
 "width": 180,
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.8,
 "iconHeight": 32,
 "shadowSpread": 1,
 "rollOverBackgroundOpacity": 1,
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "height": 50,
 "pressedBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "verticalAlign": "middle",
 "backgroundColor": [
  "#F7931E"
 ],
 "minWidth": 1,
 "label": "LOREM IPSUM",
 "pressedBackgroundOpacity": 1,
 "mode": "push",
 "shadowColor": "#000000",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": "1.96vh",
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "paddingTop": 0,
 "class": "Button",
 "iconWidth": 32,
 "backgroundColorDirection": "vertical",
 "fontWeight": "bold",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "Button Lorem Ipsum"
 },
 "layout": "horizontal"
},
{
 "id": "HTMLText_0B42C466_11C0_623D_4193_9FAB57A5AC33",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "scrollBarColor": "#04A3E1",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "propagateClick": false,
 "height": "45%",
 "scrollBarMargin": 2,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "paddingBottom": 10,
 "scrollBarWidth": 10,
 "paddingTop": 0,
 "class": "HTMLText",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#f7931e;font-size:7.61vh;font-family:'Bebas Neue Bold';\">___</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.7vh;font-family:'Montserrat';\"><B>LOREM IPSUM</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.7vh;font-family:'Montserrat';\"><B>DOLOR SIT AMET</B></SPAN></SPAN></DIV></div>",
 "shadow": false,
 "data": {
  "name": "HTMLText18899"
 }
},
{
 "children": [
  "this.Image_0B48D65D_11C0_6E0F_41A2_4D6F373BABA0",
  "this.HTMLText_0B4B0DC1_11C0_6277_41A4_201A5BB3F7AE"
 ],
 "id": "Container_0D9BF47A_11C0_E215_41A4_A63C8527FF9C",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0.3,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": false,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "80%",
 "gap": 10,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "class": "Container",
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "- content"
 },
 "layout": "horizontal"
},
{
 "maxWidth": 200,
 "id": "Image_0B48D65D_11C0_6E0F_41A2_4D6F373BABA0",
 "maxHeight": 200,
 "width": "25%",
 "paddingLeft": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "url": "skin/Image_0B48D65D_11C0_6E0F_41A2_4D6F373BABA0.jpg",
 "horizontalAlign": "left",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "propagateClick": false,
 "verticalAlign": "top",
 "height": "100%",
 "minWidth": 1,
 "paddingBottom": 0,
 "paddingTop": 0,
 "class": "Image",
 "scaleMode": "fit_inside",
 "shadow": false,
 "data": {
  "name": "agent photo"
 }
},
{
 "id": "HTMLText_0B4B0DC1_11C0_6277_41A4_201A5BB3F7AE",
 "paddingLeft": 10,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "scrollBarColor": "#F7931E",
 "width": "75%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 10,
 "propagateClick": false,
 "height": "100%",
 "scrollBarMargin": 2,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "paddingBottom": 10,
 "scrollBarWidth": 10,
 "paddingTop": 0,
 "class": "HTMLText",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#f7931e;font-size:2.07vh;font-family:'Montserrat';\"><B>JOHN DOE</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:1.74vh;font-family:'Montserrat';\">LICENSED REAL ESTATE SALESPERSON</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.2vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#999999;font-family:'Montserrat';\">Tlf.: +11 111 111 111</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#999999;font-family:'Montserrat';\">jhondoe@realestate.com</SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#999999;font-family:'Montserrat';\">www.loremipsum.com</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.2vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"/></p><p STYLE=\"margin:0; line-height:1.2vh;\"><BR STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh;color:#000000;font-size:1.2vh;font-family:Arial, Helvetica, sans-serif;\">Mauris aliquet neque quis libero consequat vestibulum. Donec lacinia consequat dolor viverra sagittis. Praesent consequat porttitor risus, eu condimentum nunc. Proin et velit ac sapien luctus efficitur egestas ac augue. Nunc dictum, augue eget eleifend interdum, quam libero imperdiet lectus, vel scelerisque turpis lectus vel ligula. Duis a porta sem. Maecenas sollicitudin nunc id risus fringilla, a pharetra orci iaculis. Aliquam turpis ligula, tincidunt sit amet consequat ac, imperdiet non dolor.</SPAN></DIV></div>",
 "shadow": false,
 "data": {
  "name": "HTMLText19460"
 }
}],
 "gap": 10,
 "buttonToggleMute": "this.Button_4C5C0864_5A8E_C472_41C4_7C0748488A41",
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "verticalAlign": "top",
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "mouseWheelEnabled": true,
 "class": "Player",
 "vrPolyfillScale": 1,
 "mobileMipmappingEnabled": false,
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Player468"
 },
 "layout": "absolute"
};

    
    function HistoryData(playList) {
        this.playList = playList;
        this.list = [];
        this.pointer = -1;
    }

    HistoryData.prototype.add = function(index){
        if(this.pointer < this.list.length && this.list[this.pointer] == index) {
            return;
        }
        ++this.pointer;
        this.list.splice(this.pointer, this.list.length - this.pointer, index);
    };

    HistoryData.prototype.back = function(){
        if(!this.canBack()) return;
        this.playList.set('selectedIndex', this.list[--this.pointer]);
    };

    HistoryData.prototype.forward = function(){
        if(!this.canForward()) return;
        this.playList.set('selectedIndex', this.list[++this.pointer]);
    };

    HistoryData.prototype.canBack = function(){
        return this.pointer > 0;
    };

    HistoryData.prototype.canForward = function(){
        return this.pointer >= 0 && this.pointer < this.list.length-1;
    };
    //

    if(script.data == undefined)
        script.data = {};
    script.data["history"] = {};    //playListID -> HistoryData

    TDV.PlayerAPI.defineScript(script);
})();
