-- ====================================================================
-- Lazy Mouse Terrain Painter (FS25 / GIANTS Engine 10)
-- RELEASE BUILD V2.6: Fixed Tab Detection & Primary Mouse Autoscroll
-- Author: Pretengineer
--
-- ROADMAP / FUTURE UPDATES:
-- [ ] Gamepad/Controller Support:
--     - Add InputAction mapping for gamepad hold (e.g. LB/L1) in modDesc.xml.
--     - Poll g_inputBinding:getIsInputActive() alongside hardware keyEvent.
--     - Add D-Pad Left/Right radius adjustment when in gamepad input mode.
-- ====================================================================

LazyMouseTerrainPainter = {}
LazyMouseTerrainPainter.MOD_NAME = g_currentModName or "FS25_LazyMouseTerrainPainter"

LazyMouseTerrainPainter.isHoldActive = false
LazyMouseTerrainPainter.hasHookedConstruction = false

-- Adjustable Tether Variables
LazyMouseTerrainPainter.tetherRadius = 0.06
LazyMouseTerrainPainter.MIN_RADIUS = 0.01
LazyMouseTerrainPainter.MAX_RADIUS = 0.25
LazyMouseTerrainPainter.RADIUS_STEP = 0.005

LazyMouseTerrainPainter.cursorScreenX = 0.5
LazyMouseTerrainPainter.cursorScreenY = 0.5
LazyMouseTerrainPainter.anchorScreenX = 0.5
LazyMouseTerrainPainter.anchorScreenY = 0.5

function LazyMouseTerrainPainter:loadMap(name)
    if g_dedicatedServer then return end
end

function LazyMouseTerrainPainter:deleteMap()
    if g_dedicatedServer then return end
    self.hasHookedConstruction = false
end

-- ====================================================================
-- Mode Detection: Safe Landscaping Verification
-- ====================================================================
function LazyMouseTerrainPainter:isLandscapingActive(screenSelf)
    if screenSelf == nil then return false end

    -- 1. Tab enum check if explicitly set by GIANTS ConstructionScreen
    if ConstructionScreen ~= nil and ConstructionScreen.TAB_LANDSCAPING ~= nil then
        if screenSelf.selectedTab == ConstructionScreen.TAB_LANDSCAPING or screenSelf.currentTab == ConstructionScreen.TAB_LANDSCAPING then
            return true
        end
    end

    -- 2. Inspect category name labels
    local label = screenSelf.selectedTabName or screenSelf.currentTabName or screenSelf.currentCategoryName or screenSelf.selectedCategoryName
    if label ~= nil and type(label) == "string" then
        local lowerLabel = string.lower(label)
        if string.find(lowerLabel, "landscap") ~= nil or string.find(lowerLabel, "sculpt") ~= nil or string.find(lowerLabel, "paint") ~= nil then
            return true
        end
        -- Explicit non-landscaping categories
if string.find(lowerLabel, "build") ~= nil
            or string.find(lowerLabel, "product") ~= nil
            or string.find(lowerLabel, "animal") ~= nil
            or string.find(lowerLabel, "decor") ~= nil
            or string.find(lowerLabel, "shed") ~= nil then            return false
        end
    end

    -- 3. Check for active terrain sculpting/painting tool in currentBrush
    local brush = screenSelf.currentBrush or screenSelf.brush
    if brush ~= nil then
        if brush.type ~= nil or (brush.cursor ~= nil and brush.cursor.isActive == true and brush.cursor.isVisible == true) then
            return true
        end
    end

    -- Default fallback: active to preserve core functionality if UI structure changes
    return true
end

-- ====================================================================
-- ConstructionScreen Hook
-- ====================================================================
function LazyMouseTerrainPainter:tryHookConstructionScreen()
    if self.hasHookedConstruction then return true end

    local targetScreen = ConstructionScreen
    if targetScreen == nil and g_gui ~= nil and g_gui.screens ~= nil then
        targetScreen = g_gui.screens["ConstructionScreen"]
    end

    if targetScreen ~= nil then
        
        -- 1. Hook Mouse Event (Feeds smoothed anchor to brush + Primary mouse to camera autoscroll)
        local origMouseEvent = targetScreen.mouseEvent
        targetScreen.mouseEvent = function(screenSelf, posX, posY, isDown, isUp, button, eventUsed)
            LazyMouseTerrainPainter.cursorScreenX = posX
            LazyMouseTerrainPainter.cursorScreenY = posY

            local isLandscaping = LazyMouseTerrainPainter:isLandscapingActive(screenSelf)

            -- If Alt is not held or not in Landscaping, pass raw coordinates natively
            if not LazyMouseTerrainPainter.isHoldActive or not isLandscaping then
                LazyMouseTerrainPainter.anchorScreenX = posX
                LazyMouseTerrainPainter.anchorScreenY = posY
                if origMouseEvent ~= nil then
                    return origMouseEvent(screenSelf, posX, posY, isDown, isUp, button, eventUsed)
                end
                return
            end

            -- 2D Tether Physics Smoothing
            local aspectRatio = g_screenAspectRatio or (16 / 9)
            local deltaX = (posX - LazyMouseTerrainPainter.anchorScreenX) * aspectRatio
            local deltaY = posY - LazyMouseTerrainPainter.anchorScreenY
            local dist = math.sqrt(deltaX * deltaX + deltaY * deltaY)

            if dist > LazyMouseTerrainPainter.tetherRadius then
                local unitX = deltaX / dist
                local unitY = deltaY / dist
                LazyMouseTerrainPainter.anchorScreenX = posX - (unitX * LazyMouseTerrainPainter.tetherRadius) / aspectRatio
                LazyMouseTerrainPainter.anchorScreenY = posY - (unitY * LazyMouseTerrainPainter.tetherRadius)
            end

            -- Step A: Feed smoothed anchor coordinates into the base game for brush manipulation
            local ret = nil
            if origMouseEvent ~= nil then
                ret = origMouseEvent(screenSelf, LazyMouseTerrainPainter.anchorScreenX, LazyMouseTerrainPainter.anchorScreenY, isDown, isUp, button, eventUsed)
            end

            -- Step B: Re-feed PRIMARY hardware cursor to the camera for edge autoscrolling
            -- (Never modify screenSelf.mousePosX/Y directly so the brush remains on the anchor)
            local cam = screenSelf.camera or screenSelf.topDownCamera or screenSelf.guiTopDownCamera
            if cam == nil and screenSelf.target ~= nil then
                cam = screenSelf.target.camera or screenSelf.target.topDownCamera
            end

            if cam ~= nil then
                if cam.mouseEvent ~= nil then
                    cam:mouseEvent(posX, posY, isDown, isUp, button, eventUsed)
                end
                cam.mousePosX = posX
                cam.mousePosY = posY
                if cam.lastMousePosX ~= nil then cam.lastMousePosX = posX end
                if cam.lastMousePosY ~= nil then cam.lastMousePosY = posY end
            end

            return ret
        end

        -- 2. Hook Key Event (Activation & Length adjustment)
        local origKeyEvent = targetScreen.keyEvent
        targetScreen.keyEvent = function(screenSelf, unicode, sym, modifier, isDown)
            local isLandscaping = LazyMouseTerrainPainter:isLandscapingActive(screenSelf)

            if sym == Input.KEY_lalt or sym == 308 or sym == Input.KEY_ralt or sym == 307 then
                if isLandscaping then
                    LazyMouseTerrainPainter.isHoldActive = isDown
                    if not isDown then
                        LazyMouseTerrainPainter.anchorScreenX = LazyMouseTerrainPainter.cursorScreenX
                        LazyMouseTerrainPainter.anchorScreenY = LazyMouseTerrainPainter.cursorScreenY
                    end
                else
                    LazyMouseTerrainPainter.isHoldActive = false
                end
                
                if origKeyEvent ~= nil then return origKeyEvent(screenSelf, unicode, sym, modifier, isDown) end
                return false
            
            elseif isDown and LazyMouseTerrainPainter.isHoldActive and isLandscaping then
                if sym == Input.KEY_rbracket or sym == 93 then
                    LazyMouseTerrainPainter.tetherRadius = math.min(LazyMouseTerrainPainter.MAX_RADIUS, LazyMouseTerrainPainter.tetherRadius + LazyMouseTerrainPainter.RADIUS_STEP)
                    return true
                elseif sym == Input.KEY_lbracket or sym == 91 then
                    LazyMouseTerrainPainter.tetherRadius = math.max(LazyMouseTerrainPainter.MIN_RADIUS, LazyMouseTerrainPainter.tetherRadius - LazyMouseTerrainPainter.RADIUS_STEP)
                    return true
                end
            end
            
            if origKeyEvent ~= nil then return origKeyEvent(screenSelf, unicode, sym, modifier, isDown) end
        end

        -- 3. Hook Draw Event (Tether rendering)
        local origDraw = targetScreen.draw
        targetScreen.draw = function(screenSelf)
            if origDraw ~= nil then origDraw(screenSelf) end
            if LazyMouseTerrainPainter:isLandscapingActive(screenSelf) then
                LazyMouseTerrainPainter:drawTether()
            end
        end
        
        -- 4. Hook Update Event (Context-aware F1 Help Integration)
        local origUpdate = targetScreen.update
        targetScreen.update = function(screenSelf, dt)
            if origUpdate ~= nil then origUpdate(screenSelf, dt) end
            
            if g_currentMission ~= nil and g_currentMission.addExtraPrintText ~= nil then
                if LazyMouseTerrainPainter:isLandscapingActive(screenSelf) then
                    if LazyMouseTerrainPainter.isHoldActive then
                        g_currentMission:addExtraPrintText("Lazy Mouse: ACTIVE")
                        g_currentMission:addExtraPrintText(string.format("Tether Length: %.1f  [ [ / ] ]", LazyMouseTerrainPainter.tetherRadius * 100))
                    else
                        g_currentMission:addExtraPrintText("Lazy Mouse: Hold [Left Alt] to Stabilise")
                    end
                end
            end
        end

        self.hasHookedConstruction = true
        return true
    end
    return false
end

function LazyMouseTerrainPainter:update(dt)
    if g_dedicatedServer then return end
    
    if not self.hasHookedConstruction then
        self:tryHookConstructionScreen()
    end
end

-- ====================================================================
-- Tether Rendering
-- ====================================================================
function LazyMouseTerrainPainter:drawTether()
    if not self.isHoldActive then return end

    local x1 = self.cursorScreenX
    local y1 = self.cursorScreenY
    local x2 = self.anchorScreenX
    local y2 = self.anchorScreenY

    -- Multi-segment tether line (GIANTS safety amber)
    local steps = 24
    for i = 0, steps do
        local stepFrac = i / steps
        local px = x1 + (x2 - x1) * stepFrac
        local py = y1 + (y2 - y1) * stepFrac
        drawFilledRect(px - 0.0012, py - 0.0012, 0.0024, 0.0024, 0.95, 0.65, 0.15, 0.85)
    end

    -- Lead cursor ring (Cyan)
    local ringR = 0.006
    drawFilledRect(x1 - ringR, y1 - 0.001, ringR * 2, 0.002, 0.22, 0.77, 0.97, 0.9)
    drawFilledRect(x1 - 0.001, y1 - ringR, 0.002, ringR * 2, 0.22, 0.77, 0.97, 0.9)

    -- Trailing anchor pip (Amber)
    local brushPip = 0.004
    drawFilledRect(x2 - brushPip, y2 - 0.001, brushPip * 2, 0.002, 0.95, 0.65, 0.15, 1.0)
    drawFilledRect(x2 - 0.001, y2 - brushPip, 0.002, brushPip * 2, 0.95, 0.65, 0.15, 1.0)
end

addModEventListener(LazyMouseTerrainPainter)
