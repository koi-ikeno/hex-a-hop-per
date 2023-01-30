LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := main

# for logcat
LOCAL_LDLIBS := -llog

SDL_PATH := ../SDL
SDL_IMAGE_PATH := ../SDL2_image
SDL_MIXER_PATH := ../SDL2_mixer
SDL_NET_PATH := ../SDL2_net
SDL_TTF_PATH := ../SDL2_ttf

LOCAL_C_INCLUDES += $(LOCAL_PATH)/$(SDL_PATH)/include
#LOCAL_C_INCLUDES += $(LOCAL_PATH)/$(SDL_IMAGE_PATH)
#LOCAL_C_INCLUDES += $(LOCAL_PATH)/$(SDL_MIXER_PATH)
#LOCAL_C_INCLUDES += $(LOCAL_PATH)/$(SDL_NET_PATH)
#LOCAL_C_INCLUDES += $(LOCAL_PATH)/$(SDL_TTF_PATH)

# Add your application source files here...
LOCAL_SRC_FILES := 		\
    src\config.h \
    src\gfx.cpp \
    src\gfx_list.h \
    src\hex_puzzzle.cpp \
    src\i18n.cpp \
    src\i18n.h \
    src\level_list.h \
    src\menus.h \
    src\packfile.h \
    src\savestate.h \
    src\sfx.cpp \
    src\sfx.h \
    src\state.h \
    src\system-directory.c \
    src\system-directory.h \
    src\system-relative.c \
    src\system-relative.h \
    src\text.cpp \
    src\text.h \
    src\tiletypes.h \
    src\video.h \

LOCAL_SHARED_LIBRARIES := SDL2 SDL2_image SDL2_mixer SDL2_net SDL2_ttf

LOCAL_LDLIBS := -lGLESv1_CM -lGLESv2 -llog

include $(BUILD_SHARED_LIBRARY)
