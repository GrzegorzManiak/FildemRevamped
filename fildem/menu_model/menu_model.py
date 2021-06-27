#!/usr/bin/python3

import dbus
import time

from ..treelib import Node, Tree

from fildem.menu_model.menu_item import DbusGtkMenuItem, DbusAppMenuItem


class DbusGtkMenu(object):

	def __init__(self, session, window):
		self.results      = {}
		self.actions      = {}
		self.accels       = {}
		self.items        = []
		self.tree         = Tree()
		self.session      = session
		self.bus_name     = window.get_utf8_prop('_GTK_UNIQUE_BUS_NAME')
		# with app. prefix
		self.app_path     = window.get_utf8_prop('_GTK_APPLICATION_OBJECT_PATH')
		# with win. prefix
		self.win_path     = window.get_utf8_prop('_GTK_WINDOW_OBJECT_PATH')
		# with unity. prefix
		self.menubar_path = window.get_utf8_prop('_GTK_MENUBAR_OBJECT_PATH')
		self.appmenu_path = window.get_utf8_prop('_GTK_APP_MENU_OBJECT_PATH')

		self.top_level_menus = []
		self.signal_matcher = []

	def activate(self, selection):
		action = self.actions.get(selection, '')

		if 'app.' in action:
			self.send_action(action, 'app.', self.app_path)
		elif 'win.' in action:
			self.send_action(action, 'win.', self.win_path)
		elif 'unity.' in action:
			self.send_action(action, 'unity.', self.menubar_path)

	def send_action(self, name, prefix, path):
		obj       = self.session.get_object(self.bus_name, path)
		interface = dbus.Interface(obj, dbus_interface='org.gtk.Actions')

		interface.Activate(name.replace(prefix, ''), [], dict())

	def get_results(self):
		paths = [self.appmenu_path, self.menubar_path]

		for path in filter(None, paths):
			obj       = self.session.get_object(self.bus_name, path)
			interface = dbus.Interface(obj, dbus_interface='org.gtk.Menus')
			try:
				results   = interface.Start([x for x in range(1024)])
				interface.End([x for x in range(1024)])
			except Exception:
				continue

			s = interface.connect_to_signal('Changed', self.on_actions_changed)
			self.signal_matcher.append(s)
			self.connect_to_actions_iface(object)

			for menu in results:
				self.results[(menu[0], menu[1])] = menu[2]

		self.tree.create_node('Root', 'Root')
		self.collect_entries(treelib_parent='Root')
		# self.tree.show()

	def collect_entries(self, menu=(0, 0), labels=[], treelib_parent=None):
		section = (menu[0], menu[1])
		for menu in self.results.get(section, []):
			if 'label' in menu:
				if len(labels) == 0:
					self.top_level_menus.append(menu.get('label', None))

				menu_item = DbusGtkMenuItem(menu, labels)
				menu_item.section = section
				description = self.describe(menu_item.action)
				if description is not None:
					menu_item.enabled = description[0]
					menu_item.set_toggle(description[1])

				menu_path = labels + [menu_item.label]

				self.tree.create_node(menu_item.label, menu_item.action, parent=treelib_parent, data=menu_item)

				if ':submenu' in menu:
					self.collect_entries(menu[':submenu'], menu_path, menu_item.action)
				elif 'action' in menu:
					self.actions[menu_item.text] = menu_item.action
					self.items.append(menu_item)

			elif ':section' in menu:
				self.collect_entries(menu[':section'], labels, treelib_parent)

	def describe(self, action):
		"""
		Describe return this:
		dbus.Struct((
		 dbus.Boolean(True), # enabled
		 dbus.Signature(''),
		 dbus.Array([ # This is empty in a not checked item
		  dbus.Boolean(True, variant_level=1)], # Checked or not
		  signature=dbus.Signature('v'))),
		 signature=None)
		"""
		if action.startswith('unity'):
			path = self.menubar_path
		elif action.startswith('win'):
			path = self.win_path
		elif action.startswith('app'):
			path = self.app_path
		else:
			return None

		dot = action.find('.')
		action = action[dot+1:]
		obj = self.session.get_object(self.bus_name, path)
		interface = dbus.Interface(obj, dbus_interface='org.gtk.Actions')

		try:
			description = interface.Describe(action)
		except Exception as e:
			# import traceback; traceback.print_exc()
			return None
		enabled = description[0]
		checked = description[2]
		return enabled, checked

	def connect_to_actions_iface(self, obj):
		try:
			iface = dbus.Interface(obj, dbus_interface='org.gtk.Actions')
			s = iface.connect_to_signal('Changed', self.on_gtk_actions_changed)
			self.signal_matcher.append(s)
		except Exception as e:
			pass

	def on_actions_changed(self, *args):
		print(f'on_actions_changed {args=}')

	def on_gtk_actions_changed(self, removed_actions, enabled_changed, state_changed, new_actions):
		"""
		The name of the actions doesn't have the unity. app. or win. preprended
		"""
		print(f'on_gtk_actions_changed')
		for action_name in enabled_changed:
			item = filter(lambda it: it.action.endswith(action_name), self.items)
			item = next(item, None)
			if item is not None:
				item.set_enabled(enabled_changed[action_name])
			# item.set_description(self.describe(item.action))

		for action_name in state_changed:
			item = filter(lambda it: it.action.endswith(action_name), self.items)
			item = next(item, None)
			if item is not None:
				item.set_description(self.describe(item.action))

	def remove_actions_listener(self):
		for s in self.signal_matcher:
			s.remove()
		self.signal_matcher = []


class DbusAppMenu(object):

	def __init__(self, session, window):
		self.actions   = {}
		self.accels    = {}
		self.items     = []
		self.tree      = Tree()
		self.session   = session
		self.window    = window
		self.signal_matcher = []
		self.interface = self.get_interface()
		self.top_level_menus = []
		self.results = None

	def activate(self, selection):
		action = self.actions[selection]
		try:
			self.interface.Event(action, 'clicked', 0, 0)
		except Exception as e:
			self.retry_activate(selection)

	def retry_activate(self, selection):
		# Electron apps change a lot their menus, we have to update to retry
		self.actions = {}
		self.accels = {}
		self.items = []
		self.tree = Tree()
		results = self.interface.GetLayout(0, -1, dbus.Array(signature="s"))
		self.collect_entries(results[1], [])
		action = self.actions[selection]
		self.interface.Event(action, 'clicked', 0, 0)

	def get_interface(self):
		bus_name = 'com.canonical.AppMenu.Registrar'
		bus_path = '/com/canonical/AppMenu/Registrar'

		try:
			obj        = self.session.get_object(bus_name, bus_path)
			interface  = dbus.Interface(obj, bus_name)
			name, path = interface.GetMenuForWindow(self.window.get_xid())
			obj        = self.session.get_object(name, path)
			interface  = dbus.Interface(obj, 'com.canonical.dbusmenu')

			# s = interface.connect_to_signal('ItemsPropertiesUpdated', self.on_actions_changed)
			# self.signal_matcher.append(s)

			return interface
		except dbus.exceptions.DBusException:
			# import traceback; traceback.print_exc()
			return None

	def get_results(self):
		if self.interface:
			self.results = self.interface.GetLayout(0, -1, dbus.Array(signature="s"))
			self.tree.create_node('Root', 'Root')
			try:
				self.collect_entries(self.results[1], treelib_parent='Root')
				self.tree.show()
			except Exception:
				pass

	def collect_entries(self, item=None, labels=None, treelib_parent=None):
		if self.results is None:
			return
		if item is None:
			item = self.results[1]
		if labels is None:
			labels = []
		menu_item = DbusAppMenuItem(item, labels)
		menu_path = labels

		if 'children-display' in item[1]:
			item_id = item[0]
			try:
				self.interface.AboutToShow(item_id)
			except Exception:
				pass
			self.interface.Event(item_id, 'opened', 'not used', dbus.UInt32(time.time()))
			item = self.interface.GetLayout(item_id, -1, dbus.Array(signature="s"))[1]

		if bool(menu_item.label) and menu_item.label != 'Root' and menu_item.label != 'DBusMenuRoot':
			menu_path = labels + [menu_item.label]

		if len(item[2]):
			if not self.top_level_menus:
				self.top_level_menus = list(map(lambda c: c[1].get('label', ''), item[2]))

			for child in item[2]:
				self.collect_entries(child, menu_path, menu_item.action)

		elif bool(menu_item.label) or menu_item.separator:
			self.actions[menu_item.text] = menu_item.action
			self.items.append(menu_item)
			self.tree.create_node(menu_item.label, menu_item.action, parent=treelib_parent, data=menu_item)

	def on_actions_changed(self, updated, removed):
		print(f'251:{updated=}')
		for upd in updated:
			action_number = int(upd[0])
			item = filter(lambda x: x.action == action_number, self.items)
			item = next(item, None)
			print(f'{item.label if item is not None else None}, ', end='')
			if item is not None:
				item.update_props(upd[1])
			else:
				print("upd not found ", upd)

		print(f'\n279:{removed=}')

	def remove_actions_listener(self):
		for s in self.signal_matcher:
			s.remove()
		self.signal_matcher = []


class MenuModel:
	# The menubars have to be reused so they are cleanup
	def __init__(self, session, window):
		self.appmenu = None
		self.gtkmenu = None
		self._session = session
		self.window = window
		self._init_window(session, window)

	def _init_window(self, session, window):
		self.appmenu = DbusAppMenu(session, window)
		self.gtkmenu = DbusGtkMenu(session, window)

	def _update_menus(self):
		self.gtkmenu.get_results()
		if not len(self.gtkmenu.items):
			self.appmenu.get_results()

	@property
	def prompt(self):
		return self.window.get_app_name()

	@property
	def actions(self):
		actions = self.gtkmenu.actions
		if not len(actions):
			actions = self.appmenu.actions

		self.handle_empty(actions)

		return actions.keys()

	@property
	def accel(self):
		accel = self.gtkmenu.accels
		if not len(accel):
			accel = self.appmenu.accels
		return accel

	@property
	def items(self):
		items = self.appmenu.items
		if not len(items):
			items = self.gtkmenu.items
		return items

	@property
	def tree(self):
		tree = self.appmenu.tree
		if not len(tree):
			tree = self.gtkmenu.tree
		return tree

	@property
	def top_level_menus(self):
		if len(self.gtkmenu.top_level_menus):
			return self.gtkmenu.top_level_menus
		else:
			return self.appmenu.top_level_menus

	def activate(self, selection):
		if selection in self.gtkmenu.actions:
			self.gtkmenu.activate(selection)

		elif selection in self.appmenu.actions:
			self.appmenu.activate(selection)

	def handle_empty(self, actions):
		if not len(actions):
			alert = 'No menu items available!'
			promt = ''
			try:
				promt = self.prompt
			except Exception as e:
				pass
			print('Gnome HUD: WARNING: (%s) %s' % (promt, alert))

	def __del__(self):
		if self.appmenu is not None:
			self.appmenu.remove_actions_listener()
		if self.gtkmenu is not None:
			self.gtkmenu.remove_actions_listener()
