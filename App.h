#pragma once
class CApp :
    public CWinApp
{
public:
    BOOL InitInstance();
};

class CMainWin :
    public CFrameWnd
{
	HGLRC m_hrc;
public:	CMainWin(void);
	  void OnSize(unsigned int type, int x, int y);
	  void OnPaint(void);
	  void GLInit(void);
	  void OnOpenGL(void);
	  void OnRobot(void);
	  void OnHScroll(UINT SBCode, UINT Pos, CScrollBar* SB);
	  void OnVScroll(UINT SBCode, UINT Pos, CScrollBar* SB);
	  DECLARE_MESSAGE_MAP()
};
