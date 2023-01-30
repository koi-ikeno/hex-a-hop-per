/*
    Copyright (C) 2005-2007 Tom Beaumont

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301 USA
*/

#include "i18n.h"

#include "state.h"
#include "sfx.h"
#include "text.h"
#include "system-relative.h"
#include <cassert>
#include <SDL.h>
#include <SDL_image.h>
#include <android/log.h>

//#define USE_OPENGL 1

#undef USE_BBTABLET

#include <algorithm>
#include <string>

StateMakerBase* StateMakerBase::first = 0;
State* StateMakerBase::current = 0;

char* LoadSaveDialog(bool /*save*/, bool /*levels*/, const char * /*title*/)
{
	return 0;
}

extern void test();

int mouse_buttons = 0;
int mousex= 10, mousey = 10;
int noMouse = 0;
int quitting = 0;

double stylusx= 0, stylusy= 0;
int stylusok= 0;
float styluspressure = 0;
SDL_Surface * screen = 0;
SDL_Surface * realScreen = 0;
SDL_Window* w;
SDL_Renderer* sdl_renderer;
int windowWidth ,windowHeight;
double ratioW , ratioH;

//extern State* MakeWorld();

bool fullscreen = true;

void InitScreen()
{
#ifdef USE_OPENGL
	SDL_GL_SetAttribute( SDL_GL_RED_SIZE, 5 );
	SDL_GL_SetAttribute( SDL_GL_GREEN_SIZE, 5 );
	SDL_GL_SetAttribute( SDL_GL_BLUE_SIZE, 5 );
	SDL_GL_SetAttribute( SDL_GL_DEPTH_SIZE, 16 );
	SDL_GL_SetAttribute( SDL_GL_DOUBLEBUFFER, 1 );

//	printf("SDL_SetVideoMode (OpenGL)\n");
    w = SDL_CreateWindow(
		"CreateWindow gfx.cpp 146",
		SDL_WINDOWPOS_UNDEFINED,//X  another option: SDL_WINDOWPOS_CENTERED
		SDL_WINDOWPOS_UNDEFINED,//Y
		SCREEN_W,
		SCREEN_H,
		SDL_WINDOW_OPENGL | SDL_WINDOW_FULLSCREEN//  0 or flags in Uint32 bitmask�@ex)  "SDL_WINDOW_FULLSCREEN | SDL_WINDOW_OPENGL"
	); //fullscreen?SDL_FULLSCREEN:SDL_HWSURFACE);)
	//realScreen = SDL_GetWindowSurface(w);

#else
//	printf("SDL_SetVideoMode (non-OpenGL)\n");
	//realScreen = SDL_SetVideoMode(
	//	SCREEN_W, SCREEN_H, // Width, Height
	//	0, // Current BPP
	//	SDL_SWSURFACE | SDL_DOUBLEBUF | (fullscreen ? SDL_FULLSCREEN : 0) );

	w = SDL_CreateWindow(
		"CreateWindow gfx.cpp 146",
		SDL_WINDOWPOS_UNDEFINED,//X  another option: SDL_WINDOWPOS_CENTERED
		SDL_WINDOWPOS_UNDEFINED,//Y
		SCREEN_W,
		SCREEN_H,
		SDL_WINDOW_FULLSCREEN//SDL_WINDOW_RESIZABLE//  0 or flags in Uint32 bitmask�@ex)  "SDL_WINDOW_FULLSCREEN | SDL_WINDOW_OPENGL"
	); //fullscreen?SDL_FULLSCREEN:SDL_HWSURFACE);)
	//realScreen = SDL_GetWindowSurface(w);

    SDL_GetWindowSize(w, &windowWidth,
                       &windowHeight);

    __android_log_print(
       		    ANDROID_LOG_DEBUG,
       		    "--koi--",  "getwindowsize %d %d" , windowWidth , windowHeight);

    ratioW = ((double)SCREEN_W/(double)windowWidth);
    ratioH = ((double)SCREEN_H/(double)windowHeight);

	//NAssert(realScreen);
#endif
	
	if (screen)
		SDL_FreeSurface(screen);

	SDL_Surface* tempscreen = SDL_CreateRGBSurface(
		SDL_SWSURFACE, 
		SCREEN_W, 
		SCREEN_H,
		32,
		0xff0000, 
		0xff00,
		0xff,
		0xff000000);

	//screen = SDL_DisplayFormat(tempscreen);
	
	screen = SDL_ConvertSurfaceFormat(
		tempscreen, 
		//SDL_PIXELFORMAT_RGB555,
		//SDL_PIXELFORMAT_ARGB8888,
		SDL_PIXELFORMAT_ARGB32,
		0);
	SDL_FreeSurface(tempscreen);

	sdl_renderer = SDL_CreateRenderer(w, -1, 0);
	    if (sdl_renderer == NULL) {

            //char *errmsg = SDL_GetError();
       		__android_log_print(
               ANDROID_LOG_DEBUG,
               "--koi--",
                "%s" ,SDL_GetError()
               );
       	}else{

       	}
}

void ToggleFullscreen()
{
	fullscreen = !fullscreen;
	InitScreen();
	StateMakerBase::current->ScreenModeChanged();
}
String base_path;

int TickTimer()
{
	static int time = SDL_GetTicks();
	int cap=40;

	int x = SDL_GetTicks() - time;
	time += x;
	if (x<0) x = 0, time = SDL_GetTicks();
	if (x>cap) x = cap;

	return x;
}

String GetBasePath()
{
	return String(SDL_GetBasePath());
}

extern int currentGameStage;

int main(int /*argc*/, char * /*argv*/[])
{
	base_path = GetBasePath();
    currentGameStage = -1;

	int init = SDL_Init(SDL_INIT_VIDEO | SDL_INIT_NOPARACHUTE);
	if (init != 0) {
		const char* err = SDL_GetError();
	}


    if (!TextInit(base_path))
		return 1;

    InitScreen();
	SDL_Surface* icon = IMG_Load("/data/user/0/koisignal.hexahop.per/files/res/drawable//hex-a-hop-16.png");


	if (icon)
	{
	    SDL_SetColorKey(icon, SDL_TRUE, SDL_MapRGB(icon->format, 0, 255, 255));
		SDL_SetWindowIcon(w, icon);
		SDL_FreeSurface(icon);
	}

	InitSound("/data/user/0/koisignal.hexahop.per/files/res/audio");


    //SDL_WarpMouse(SCREEN_W/2, SCREEN_H/2);
	SDL_WarpMouseInWindow(w, SCREEN_W / 2, SCREEN_H / 2);

	int videoExposed = 1;

#ifdef USE_BBTABLET
	bbTabletDevice &td = bbTabletDevice::getInstance( );
	SDL_EventState(SDL_SYSWMEVENT, SDL_ENABLE);
#endif

	StateMakerBase::GetNew();

	while(!quitting)
	{
		SDL_Event e;
		UpdateSound(-1.0);
		//イベントが無い場合
		while(!SDL_PollEvent(&e) && !quitting)
		{
			int x = 0;
			if (true)//(SDL_focus & 6)==6)
			{
				videoExposed = 1;
				x = TickTimer();
				while (x<10)
				{
					SDL_Delay(10-x);
					x += TickTimer();
				}
				StateMakerBase::current->Update(x / 1000.0);
			}
			else
			{
				// Not focused. Try not to eat too much CPU!
				SDL_Delay(150);
			}

			// experimental...
			if (!noMouse)
				StateMakerBase::current->Mouse(mousex, mousey, 0, 0, 0, 0, mouse_buttons);

			if (videoExposed)
			{
				StateMakerBase::current->Render();
				#ifdef USE_OPENGL
					SDL_GL_SwapWindow(w);
				#else
					if (screen && realScreen!=screen)
					{
						SDL_Rect r = {0,0,SCREEN_W,SCREEN_H};
						SDL_BlitSurface(screen, &r, realScreen, &r);
					}
					//SDL_Flip(realScreen);

					SDL_RenderClear(sdl_renderer);

					SDL_Texture* texture_tmp = SDL_CreateTextureFromSurface(
						sdl_renderer,screen);

					SDL_RenderCopy(sdl_renderer,
						texture_tmp,
						NULL,	NULL);
					SDL_RenderPresent(sdl_renderer);
					SDL_DestroyTexture(texture_tmp);
					//SDL_UpdateWindowSurface(w);
				#endif
				videoExposed = 0;
			}

			SDL_Delay(10);

#ifdef USE_BBTABLET
			// Tablet ////////////////////////
			bbTabletEvent evt;
			while(hwnd!=NULL && td.getNextEvent(evt))
			{
				stylusok = 1;
				RECT r;
				if (tablet_system)
				{
					GetWindowRect(hwnd, &r);
					stylusx = evt.x * GetSystemMetrics(SM_CXSCREEN);
					stylusy = (1.0 - evt.y) * GetSystemMetrics(SM_CYSCREEN);
					stylusx -= (r.left + GetSystemMetrics(SM_CXFIXEDFRAME));
					stylusy -= (r.top + GetSystemMetrics(SM_CYFIXEDFRAME) + GetSystemMetrics(SM_CYCAPTION));;
				}
				else
				{
					GetClientRect(hwnd, &r);
					stylusx = evt.x * r.right;
					stylusy = (1.0 - evt.y) * r.bottom;
				}
				styluspressure = (evt.buttons & 1) ? evt.pressure : 0;

				/*
				printf("id=%d csrtype=%d b=%x (%0.3f, %0.3f, %0.3f) p=%0.3f tp=%0.3f\n",
					   evt.id,
					   evt.type,
					   evt.buttons,
					   evt.x,
					   evt.y,
					   evt.z,
					   evt.pressure,
					   evt.tpressure
					   );
				*/
			}

#endif
		}
		//イベントがあったとき
		switch (e.type)
		{
			//case SDL_VIDEOEXPOSE:
			case SDL_RENDER_TARGETS_RESET:
				videoExposed = 1;
				break;

			case SDL_WINDOWEVENT_TAKE_FOCUS://SDL_ACTIVEEVENT:
			{
				//int gain = e.active.gain ? e.active.state : 0;
				//int loss = e.active.gain ? 0 : e.active.state;
				//SDL_focus = (SDL_focus | gain) & ~loss;
				//if (gain & SDL_APPACTIVE)
				//	StateMakerBase::current->ScreenModeChanged();
				//if (loss & SDL_APPMOUSEFOCUS)
				//	noMouse = 1;
				//else if (gain & SDL_APPMOUSEFOCUS)
				//	noMouse = 0;

				break;
			}

			case SDL_MOUSEMOTION:
				noMouse = false;
				StateMakerBase::current->Mouse(
                    e.motion.x * ratioW ,
                    e.motion.y * ratioH ,
                    e.motion.x - mousex * ratioW ,
				    e.motion.y - mousey * ratioH ,
				    0, 0, mouse_buttons);
				 mousex = e.motion.x * ratioW ;
				 mousey = e.motion.y * ratioH ;
				break;
			case SDL_MOUSEBUTTONUP:
				noMouse = false;
				mouse_buttons &= ~(1<<(e.button.button-1));
				StateMakerBase::current->Mouse(
				    e.button.x * ratioW ,
				    e.button.y * ratioH ,
				    (e.button.x-mousex) * ratioW ,
				    (e.button.y-mousey) * ratioH ,
					0, 1<<(e.button.button-1), mouse_buttons);
				mousex = e.button.x * ratioW ;
				mousey = e.button.y * ratioH ;
				break;

			case SDL_MOUSEBUTTONDOWN:
				noMouse = false;
				mouse_buttons |= 1<<(e.button.button-1);
				StateMakerBase::current->Mouse(
				    e.button.x * ratioW ,
				    e.button.y * ratioH ,
				    (e.button.x-mousex) * ratioW ,
				    (e.button.y-mousey) * ratioH ,
					1<<(e.button.button-1), 0, mouse_buttons);
				mousex = e.button.x * ratioW ;
				mousey = e.button.y * ratioH ;
				break;

			case SDL_KEYUP:
				StateMakerBase::current->KeyReleased(e.key.keysym.sym);
				break;

			case SDL_KEYDOWN:
			{
				SDL_KeyboardEvent & k = e.key;

				//if (k.keysym.sym==SDLK_F4 && (k.keysym.mod & KMOD_ALT))
				//{
				//	quitting = 1;
				//}
				//else if (k.keysym.sym==SDLK_F12)
				//{
					// Toggle system pointer controlled by tablet or not
				//	#ifdef USE_BBTABLET
				//		if (td.isValid())
				//		{
				//			tablet_system = !tablet_system;
				//			td.setPointerMode(tablet_system ? bbTabletDevice::SYSTEM_POINTER : bbTabletDevice::SEPARATE_POINTER);
				//		}
				//	#endif
				//}
				//else if (k.keysym.sym==SDLK_RETURN && (k.keysym.mod & KMOD_ALT) && !(k.keysym.mod & KMOD_CTRL))
				//{
				//	ToggleFullscreen();
				//}

                //else if
                if (//今の状態に対応するkeypressedイベントを呼び出す
                        StateMakerBase::current->KeyPressed(k.keysym.sym, k.keysym.mod)
                        )
				{

                }
				else if ((k.keysym.mod & (KMOD_ALT | KMOD_CTRL))==0)
				{
					StateMakerBase::GetNew(k.keysym.sym);
				}
			}
			break;

			case SDL_QUIT:
				quitting = 1;
				break;
		}
	}

	TextFree();
	FreeSound();
	SDL_Quit();

 	return 0;
}
