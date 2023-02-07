#pragma comment(lib,"user32.lib")
#pragma comment(lib,"gdi32.lib")
#pragma comment(lib,"glu32.lib")
#pragma comment(lib,"opengl32.lib")
#pragma comment(lib,"glaux.lib")
#pragma comment(lib,"legacy_stdio_definitions.lib")

#include <afxwin.h>
#include <windows.h>
#include <GL/gl.h>
#include <GL/glu.h>
#include "glut.h"
#include "glaux.h"
#include "App.h" 
int hspos = 50, vspos = 50;

BOOL CApp::InitInstance()
{
	m_pMainWnd = new  CMainWin;
	m_pMainWnd->ShowWindow(m_nCmdShow);
	m_pMainWnd->UpdateWindow();
	return TRUE;
}

CApp App;
CMainWin::CMainWin()
{
	Create(NULL, "OpenGL test", WS_OVERLAPPEDWINDOW | WS_VSCROLL | WS_HSCROLL);
	PIXELFORMATDESCRIPTOR pfd;
	pfd.dwFlags = PFD_DOUBLEBUFFER;
	CClientDC dc(this);
	int nPixelFormat = ChoosePixelFormat(dc.m_hDC, &pfd); SetPixelFormat(dc.m_hDC, nPixelFormat, &pfd); m_hrc = wglCreateContext(dc.m_hDC);
	wglMakeCurrent(dc.m_hDC, m_hrc);

}
BEGIN_MESSAGE_MAP(CMainWin, CFrameWnd)
	ON_WM_SIZE()
	ON_WM_PAINT()
	ON_WM_VSCROLL()
	ON_WM_HSCROLL()
END_MESSAGE_MAP()
void CMainWin::OnSize(unsigned int type, int x, int y) {
	CClientDC dc(this);
	wglMakeCurrent(dc.m_hDC, m_hrc);
	GLdouble gldAspect = (GLdouble)x / (GLdouble)y; glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluPerspective(30.0, gldAspect, 1.0, 10.0);
	glViewport(0, 0, x, y);
	wglMakeCurrent(NULL, NULL);
}
void CMainWin::OnPaint(void)
{
	CPaintDC pDC(this);
	wglMakeCurrent(pDC.m_hDC, m_hrc);
	GLInit();
	OnOpenGL();
	SwapBuffers(pDC.m_hDC);
	wglMakeCurrent(NULL, NULL);
}
void CMainWin::GLInit(void)
{
	GLdouble marengo[3] = { 1.0,1.0,0.0 };
	glClearColor(1.0, 1.0, 1.0, 1.0);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(0.0, 0.0, -5.0);
	glColor3dv(marengo);
	glScalef(0.25, 0.25, 0.25);
}
void CMainWin::OnOpenGL(void)
{
	glRotated(360.0 * hspos / 100, 0, 1, 0);
	glRotated(360.0 * vspos / 100, 1, 0, 0);
	// auxWireTeapot(1.0); 
	OnRobot();
}
void CMainWin::OnVScroll(UINT nSBCode, UINT nPos, CScrollBar* pScrollBar) {
	char str[255];
	switch (nSBCode)
	{
	case SB_LINEDOWN: vspos++; break;
	case SB_LINEUP:vspos--; break;
	case SB_PAGEDOWN: vspos += 5; break;
	case SB_PAGEUP:vspos -= 5; break;
	case SB_THUMBTRACK: vspos = nPos; break;
	case SB_THUMBPOSITION: vspos = nPos; break;
	}
	SetScrollPos(SB_VERT, vspos);
	Invalidate(NULL);
}
void CMainWin::OnHScroll(UINT nSBCode, UINT nPos, CScrollBar* pScrollBar) {
	char str[255];
	switch (nSBCode)
	{
	case SB_LINERIGHT: hspos++; break;
	case SB_LINELEFT:hspos--; break;
	case SB_PAGERIGHT: hspos += 5; break;
	case SB_PAGELEFT:hspos -= 5; break;
	case SB_THUMBTRACK: hspos = nPos; break; case SB_THUMBPOSITION: hspos = nPos; break;
	}
	SetScrollPos(SB_HORZ, vspos);
	Invalidate(NULL);
}
void CMainWin::OnRobot(void) {
	glPushMatrix();
	glTranslatef(0.0, -3.0, 0.0);// initial transition of scene
	glRotatef(360.0 * vspos / 100, 0, 1, 0);  // 3D-rotation around Y-axis
	glRotatef(180, 0, 0, 1); // initial rotation of scene for 180 degrees around Z-axis
	glLineWidth(2.0);

	glColor3f(1.0, 0.0, 0.0);
	//glTranslatef(0.0, 1, 0.0);
	auxWireBox(2.5, 0.5, 1.5);

	//baseCyln
	glColor3f(0.0, 0.0, 1.0);
	glTranslatef(0.0, -1.30, 0.0);
	auxWireCylinder(0.6, 2.25);

	//nextbox
	glColor3f(1.0, 0.0, 0.0);
	glTranslatef(0.0, -1.75, 0.0);
	auxWireBox(1.5, 1.0, 1.5);

	glPushMatrix();
	glPushMatrix();

	//nextcylinder
	glColor3f(0.0, 0.0, 1.0);
	glTranslatef(1.75, 0.0, 0.0);
	glRotatef(90, 0, 0, -1);
	auxWireCylinder(0.3, 2.0);


	//nextcylinder
	glColor3f(0.0, 0.0, 1.0);
	glTranslatef(-1.75, 0.0, 0.0);
	glRotatef(90, 0, 0, -1);
	auxWireCylinder(0.3, 2.0);

	//topCyln
	glColor3f(0.0, 0.0, 1.0);
	glTranslatef(1.5, 1.75, 0.0);
	glRotatef(270, 0, 0, -1);
	auxWireCylinder(0.6, 2.25);

	//topbox
	glColor3f(1.0, 0.0, 0.0);
	glTranslatef(0.0, -1.5, 0.0);
	auxWireBox(1.25, 0.4, 1.5);
	//nextcylinder
	glColor3f(0.0, 1.0, 0.0);
	glTranslatef(-3.75, 3.15, 0.0);
	glRotatef(90, 0, 0, -1);
	auxWireCylinder(0.15, 1.0);

	glColor3f(1.0, 0.0, 0.0);
	glTranslatef(0.0, 0.15, 0.0);
	glRotatef(90, 1.0, 0, 0.05);
	auxWireCone(0.5, 1.0);// first parameter - radius, second - height
	glPopMatrix();
	glPopMatrix();

}  // return to the column base
